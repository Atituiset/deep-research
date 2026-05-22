const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'code_agent_evolution.html');

if (!fs.existsSync(htmlPath)) {
    console.error(`Error: code_agent_evolution.html not found!`);
    process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Upgrade ShadowMergeEngine in HTML
const upgradedShadowMergeEngine = `<pre>
<span class="syntax-keyword">interface</span> <span class="syntax-type">EditPatch</span> {
  startOffset: <span class="syntax-type">number</span>;
  endOffset: <span class="syntax-type">number</span>;
  originalText: <span class="syntax-type">string</span>;
  replacementText: <span class="syntax-type">string</span>;
}

<span class="syntax-keyword">interface</span> <span class="syntax-type">ASTNode</span> {
  type: <span class="syntax-type">string</span>;
  startOffset: <span class="syntax-type">number</span>;
  endOffset: <span class="syntax-type">number</span>;
  children: <span class="syntax-type">ASTNode</span>[];
}

<span class="syntax-keyword">class</span> <span class="syntax-function">ShadowMergeEngine</span> {
  <span class="syntax-keyword">private</span> shadowBuffer: <span class="syntax-type">string</span>;
  <span class="syntax-keyword">private</span> astRoot: <span class="syntax-type">ASTNode</span>;

  <span class="syntax-keyword">constructor</span>(initialContent: <span class="syntax-type">string</span>) {
    <span class="syntax-keyword">this</span>.shadowBuffer = initialContent;
    <span class="syntax-keyword">this</span>.astRoot = <span class="syntax-keyword">this</span>.incrementalASTParse(initialContent);
  }

  <span class="syntax-comment">/**
   * 1. 增量 AST 边界校验 (Incremental AST Boundary Check)
   * 验证 Patch 是否跨越或破坏了不可分割的语义节点（如 try_statement, class_declaration）
   */</span>
  <span class="syntax-keyword">public</span> <span class="syntax-function">validateASTBoundaries</span>(patch: <span class="syntax-type">EditPatch</span>): <span class="syntax-type">boolean</span> {
    <span class="syntax-keyword">const</span> atomicTypes = [
      <span class="syntax-string">"class_declaration"</span>, <span class="syntax-string">"function_declaration"</span>, 
      <span class="syntax-string">"arrow_function"</span>, <span class="syntax-string">"try_statement"</span>, <span class="syntax-string">"lexical_declaration"</span>
    ];
    <span class="syntax-keyword">let</span> isViolated = <span class="syntax-number">false</span>;

    <span class="syntax-keyword">const</span> traverse = (node: <span class="syntax-type">ASTNode</span>) =&gt; {
      <span class="syntax-keyword">if</span> (atomicTypes.includes(node.type)) {
        <span class="syntax-keyword">const</span> startsInside = patch.startOffset &gt; node.startOffset && patch.startOffset &lt; node.endOffset;
        <span class="syntax-keyword">const</span> endsInside = patch.endOffset &gt; node.startOffset && patch.endOffset &lt; node.endOffset;
        <span class="syntax-keyword">if</span> (startsInside || endsInside) {
          <span class="syntax-keyword">const</span> isFullyContained = patch.startOffset &gt;= node.startOffset && patch.endOffset &lt;= node.endOffset;
          <span class="syntax-keyword">const</span> isFullyWrapping = patch.startOffset &lt;= node.startOffset && patch.endOffset &gt;= node.endOffset;
          <span class="syntax-keyword">if</span> (!isFullyContained && !isFullyWrapping) {
            isViolated = <span class="syntax-number">true</span>;
          }
        }
      }
      <span class="syntax-keyword">if</span> (!isViolated) {
        node.children.forEach(traverse);
      }
    };

    traverse(<span class="syntax-keyword">this</span>.astRoot);
    <span class="syntax-keyword">return</span> !isViolated;
  }

  <span class="syntax-comment">/**
   * 2. 滑动窗口 token 推测对齐算法 (Speculative Suffix Matcher)
   * 匹配生成的 token stream 与原 buffer 的后缀，以快速跳过未改动的原始代码
   */</span>
  <span class="syntax-keyword">public</span> <span class="syntax-function">alignSpeculativeStream</span>(
    streamTokens: <span class="syntax-type">string</span>[], 
    originalTokens: <span class="syntax-type">string</span>[], 
    cursorIdx: <span class="syntax-type">number</span>, 
    windowSize: <span class="syntax-type">number</span> = <span class="syntax-number">5</span>
  ): <span class="syntax-type">number</span> {
    <span class="syntax-keyword">if</span> (streamTokens.length &lt; windowSize) <span class="syntax-keyword">return</span> -<span class="syntax-number">1</span>;
    <span class="syntax-keyword">const</span> suffix = streamTokens.slice(-windowSize);

    <span class="syntax-keyword">for</span> (<span class="syntax-keyword">let</span> i = cursorIdx; i &lt;= originalTokens.length - windowSize; i++) {
      <span class="syntax-keyword">let</span> match = <span class="syntax-number">true</span>;
      <span class="syntax-keyword">for</span> (<span class="syntax-keyword">let</span> j = <span class="syntax-number">0</span>; j &lt; windowSize; j++) {
        <span class="syntax-keyword">if</span> (originalTokens[i + j] !== suffix[j]) {
          match = <span class="syntax-number">false</span>;
          <span class="syntax-keyword">break</span>;
        }
      }
      <span class="syntax-keyword">if</span> (match) {
        <span class="syntax-keyword">return</span> i + windowSize;
      }
    }
    <span class="syntax-keyword">return</span> -<span class="syntax-number">1</span>;
  }

  <span class="syntax-comment">/**
   * 3. 生产级三路合并算法 (Myers 3-Way Merge Core)
   * 将 userWorkspace、shadowWorkspace (spec-edit 模型输出) 与 base 原始流合并，并处理冲突
   */</span>
  <span class="syntax-keyword">public</span> <span class="syntax-function">threeWayMerge</span>(userContent: <span class="syntax-type">string</span>, baseContent: <span class="syntax-type">string</span>): <span class="syntax-type">string</span> {
    <span class="syntax-keyword">const</span> baseLines = baseContent.split(<span class="syntax-string">"\\n"</span>);
    <span class="syntax-keyword">const</span> userLines = userContent.split(<span class="syntax-string">"\\n"</span>);
    <span class="syntax-keyword">const</span> shadowLines = <span class="syntax-keyword">this</span>.shadowBuffer.split(<span class="syntax-string">"\\n"</span>);

    <span class="syntax-keyword">const</span> diffUser = <span class="syntax-keyword">this</span>.myersLinearDiff(baseLines, userLines);
    <span class="syntax-keyword">const</span> diffShadow = <span class="syntax-keyword">this</span>.myersLinearDiff(baseLines, shadowLines);

    <span class="syntax-keyword">const</span> mergedLines: <span class="syntax-type">string</span>[] = [];
    <span class="syntax-keyword">let</span> bIdx = <span class="syntax-number">0</span>;

    <span class="syntax-keyword">while</span> (bIdx &lt; baseLines.length) {
      <span class="syntax-keyword">const</span> uEdit = diffUser.get(bIdx);
      <span class="syntax-keyword">const</span> sEdit = diffShadow.get(bIdx);

      <span class="syntax-keyword">if</span> (uEdit && sEdit) {
        <span class="syntax-keyword">if</span> (uEdit.text === sEdit.text) {
          mergedLines.push(uEdit.text);
        } <span class="syntax-keyword">else</span> {
          mergedLines.push(<span class="syntax-string">"&lt;&lt;&lt;&lt;&lt;&lt;&lt; USER_WORKSPACE (实时键入)"</span>);
          mergedLines.push(uEdit.text);
          mergedLines.push(<span class="syntax-string">"======="</span>);
          mergedLines.push(sEdit.text);
          mergedLines.push(<span class="syntax-string">"&gt;&gt;&gt;&gt;&gt;&gt;&gt; SHADOW_SPECULATIVE_BUFFER (AI 推测编辑)"</span>);
        }
        bIdx += Math.max(uEdit.span, sEdit.span) || <span class="syntax-number">1</span>;
      } <span class="syntax-keyword">else</span> <span class="syntax-keyword">if</span> (uEdit) {
        mergedLines.push(uEdit.text);
        bIdx += uEdit.span || <span class="syntax-number">1</span>;
      } <span class="syntax-keyword">else</span> <span class="syntax-keyword">if</span> (sEdit) {
        mergedLines.push(sEdit.text);
        bIdx += sEdit.span || <span class="syntax-number">1</span>;
      } <span class="syntax-keyword">else</span> {
        mergedLines.push(baseLines[bIdx]);
        bIdx++;
      }
    }
    <span class="syntax-keyword">return</span> mergedLines.join(<span class="syntax-string">"\\n"</span>);
  }

  <span class="syntax-comment">/**
   * 4. Myers SES (Shortest Edit Script) 动态规划与回溯算法
   * 基于 $O((N+M)D)$ 的对角线 k = x - y 演变步进，回溯差分编辑点
   */</span>
  <span class="syntax-keyword">private</span> <span class="syntax-function">myersLinearDiff</span>(base: <span class="syntax-type">string</span>[], target: <span class="syntax-type">string</span>[]): <span class="syntax-type">Map</span>&lt;<span class="syntax-type">number</span>, { span: <span class="syntax-type">number</span>, text: <span class="syntax-type">string</span> }&gt; {
    <span class="syntax-keyword">const</span> N = base.length;
    <span class="syntax-keyword">const</span> M = target.length;
    <span class="syntax-keyword">const</span> maxD = N + M;
    <span class="syntax-keyword">const</span> V: { [k: <span class="syntax-type">number</span>]: <span class="syntax-type">number</span> } = { <span class="syntax-number">1</span>: <span class="syntax-number">0</span> };
    <span class="syntax-keyword">const</span> history: { [d: <span class="syntax-type">number</span>]: { [k: <span class="syntax-type">number</span>]: <span class="syntax-type">number</span> } } = {};
    <span class="syntax-keyword">const</span> editMap = <span class="syntax-keyword">new</span> Map&lt;<span class="syntax-type">number</span>, { span: <span class="syntax-type">number</span>, text: <span class="syntax-type">string</span> }&gt;();
    
    <span class="syntax-keyword">if</span> (maxD === <span class="syntax-number">0</span>) <span class="syntax-keyword">return</span> editMap;
    
    <span class="syntax-keyword">let</span> found = <span class="syntax-number">false</span>;
    <span class="syntax-keyword">let</span> d = <span class="syntax-number">0</span>;
    <span class="syntax-keyword">for</span> (d = <span class="syntax-number">0</span>; d &lt;= maxD; d++) {
      history[d] = { ...V };
      <span class="syntax-keyword">for</span> (<span class="syntax-keyword">let</span> k = -d; k &lt;= d; k += <span class="syntax-number">2</span>) {
        <span class="syntax-keyword">let</span> x = <span class="syntax-number">0</span>;
        <span class="syntax-keyword">let</span> prevK = <span class="syntax-number">0</span>;
        <span class="syntax-keyword">if</span> (k === -d || (k !== d && (V[k - <span class="syntax-number">1</span>] ?? -<span class="syntax-number">1</span>) &lt; (V[k + <span class="syntax-number">1</span>] ?? -<span class="syntax-number">1</span>))) {
          prevK = k + <span class="syntax-number">1</span>;
          x = V[prevK]; 
        } <span class="syntax-keyword">else</span> {
          prevK = k - <span class="syntax-number">1</span>;
          x = V[prevK] + <span class="syntax-number">1</span>; 
        }
        <span class="syntax-keyword">let</span> y = x - k;
        <span class="syntax-keyword">while</span> (x &lt; N && y &lt; M && base[x] === target[y]) {
          x++;
          y++;
        }
        V[k] = x;
        <span class="syntax-keyword">if</span> (x &gt;= N && y &gt;= M) {
          found = <span class="syntax-number">true</span>;
          <span class="syntax-keyword">break</span>;
        }
      }
      <span class="syntax-keyword">if</span> (found) <span class="syntax-keyword">break</span>;
    }
    
    <span class="syntax-keyword">const</span> path: { x: <span class="syntax-type">number</span>; y: <span class="syntax-type">number</span> }[] = [];
    <span class="syntax-keyword">let</span> currK = N - M;
    <span class="syntax-keyword">let</span> currX = N;
    
    <span class="syntax-keyword">for</span> (<span class="syntax-keyword">let</span> step = d; step &gt;= <span class="syntax-number">0</span>; step--) {
      <span class="syntax-keyword">const</span> stepV = history[step];
      <span class="syntax-keyword">if</span> (!stepV) <span class="syntax-keyword">break</span>;
      
      <span class="syntax-keyword">let</span> prevK = <span class="syntax-number">0</span>;
      <span class="syntax-keyword">if</span> (currK === -step || (currK !== step && (stepV[currK - <span class="syntax-number">1</span>] ?? -<span class="syntax-number">1</span>) &lt; (stepV[currK + <span class="syntax-number">1</span>] ?? -<span class="syntax-number">1</span>))) {
        prevK = currK + <span class="syntax-number">1</span>;
      } <span class="syntax-keyword">else</span> {
        prevK = currK - <span class="syntax-number">1</span>;
      }
      
      <span class="syntax-keyword">const</span> prevX = stepV[prevK] ?? <span class="syntax-number">0</span>;
      <span class="syntax-keyword">const</span> prevY = prevX - prevK;
      
      <span class="syntax-keyword">while</span> (currX &gt; prevX && (currX - currK) &gt; prevY) {
        path.push({ x: currX, y: currX - currK });
        currX--;
      }
      
      path.push({ x: prevX, y: prevY });
      currX = prevX;
      currK = prevK;
    }
    
    path.reverse();
    
    <span class="syntax-keyword">let</span> idx = <span class="syntax-number">0</span>;
    <span class="syntax-keyword">while</span> (idx &lt; path.length - <span class="syntax-number">1</span>) {
      <span class="syntax-keyword">const</span> curr = path[idx];
      <span class="syntax-keyword">const</span> next = path[idx + <span class="syntax-number">1</span>];
      <span class="syntax-keyword">const</span> dx = next.x - curr.x;
      <span class="syntax-keyword">const</span> dy = next.y - curr.y;
      
      <span class="syntax-keyword">if</span> (dx === <span class="syntax-number">1</span> && dy === <span class="syntax-number">1</span>) {
        idx++;
      } <span class="syntax-keyword">else</span> {
        <span class="syntax-keyword">const</span> startX = curr.x;
        <span class="syntax-keyword">const</span> startY = curr.y;
        <span class="syntax-keyword">let</span> endX = next.x;
        <span class="syntax-keyword">let</span> endY = next.y;
        
        idx++;
        <span class="syntax-keyword">while</span> (idx &lt; path.length - <span class="syntax-number">1</span>) {
          <span class="syntax-keyword">const</span> c = path[idx];
          <span class="syntax-keyword">const</span> n = path[idx + <span class="syntax-number">1</span>];
          <span class="syntax-keyword">if</span> (n.x - c.x === <span class="syntax-number">1</span> && n.y - c.y === <span class="syntax-number">1</span>) <span class="syntax-keyword">break</span>;
          endX = n.x;
          endY = n.y;
          idx++;
        }
        
        <span class="syntax-keyword">const</span> span = endX - startX;
        <span class="syntax-keyword">const</span> text = target.slice(startY, endY).join(<span class="syntax-string">"\\n"</span>);
        
        <span class="syntax-keyword">if</span> (span === <span class="syntax-number">0</span>) {
          <span class="syntax-keyword">if</span> (startX &lt; N) {
            editMap.set(startX, { span: <span class="syntax-number">1</span>, text: text + (text ? <span class="syntax-string">"\\n"</span> : <span class="syntax-string">""</span>) + base[startX] });
          } <span class="syntax-keyword">else</span> {
            <span class="syntax-keyword">const</span> lastIdx = N - <span class="syntax-number">1</span>;
            <span class="syntax-keyword">if</span> (lastIdx &gt;= <span class="syntax-number">0</span>) {
              <span class="syntax-keyword">const</span> existing = editMap.get(lastIdx);
              <span class="syntax-keyword">if</span> (existing) {
                existing.text += <span class="syntax-string">"\\n"</span> + text;
              } <span class="syntax-keyword">else</span> {
                editMap.set(lastIdx, { span: <span class="syntax-number">1</span>, text: base[lastIdx] + <span class="syntax-string">"\\n"</span> + text });
              }
            } <span class="syntax-keyword">else</span> {
              editMap.set(<span class="syntax-number">0</span>, { span: <span class="syntax-number">1</span>, text: text });
            }
          }
        } <span class="syntax-keyword">else</span> {
          editMap.set(startX, { span, text });
        }
      }
    }
    <span class="syntax-keyword">return</span> editMap;
  }

  <span class="syntax-comment">/**
   * 5. 增量 AST 结构与词法范围解析器
   * 采用单向扫描及括号栈帧（Scope Brace Stack）分析 TS/JS 源码，物理定位 Class/Function 物理坐标区间
   */</span>
  <span class="syntax-keyword">private</span> <span class="syntax-function">incrementalASTParse</span>(code: <span class="syntax-type">string</span>): <span class="syntax-type">ASTNode</span> {
    <span class="syntax-keyword">const</span> root: <span class="syntax-type">ASTNode</span> = { type: <span class="syntax-string">"program"</span>, startOffset: <span class="syntax-number">0</span>, endOffset: code.length, children: [] };
    <span class="syntax-keyword">const</span> stack: { type: <span class="syntax-type">string</span>; startOffset: <span class="syntax-type">number</span>; name?: <span class="syntax-type">string</span> }[] = [];
    <span class="syntax-keyword">const</span> childrenMap: { [depth: <span class="syntax-type">number</span>]: <span class="syntax-type">ASTNode</span>[] } = { <span class="syntax-number">0</span>: [] };
    
    <span class="syntax-keyword">let</span> i = <span class="syntax-number">0</span>;
    <span class="syntax-keyword">while</span> (i &lt; code.length) {
      <span class="syntax-keyword">const</span> char = code[i];
      <span class="syntax-keyword">if</span> (char === <span class="syntax-string">"{"</span>) {
        <span class="syntax-keyword">const</span> lookback = code.substring(Math.max(<span class="syntax-number">0</span>, i - <span class="syntax-number">120</span>), i);
        <span class="syntax-keyword">let</span> type = <span class="syntax-string">"block"</span>;
        <span class="syntax-keyword">let</span> name = <span class="syntax-string">""</span>;
        
        <span class="syntax-keyword">const</span> classMatch = lookback.match(/\\bclass\\s+(\\w+)\\b/);
        <span class="syntax-keyword">const</span> funcMatch = lookback.match(/\\b(function|public|private|async|constructor)\\s+(\\w+)?\\b/);
        <span class="syntax-keyword">const</span> tryMatch = lookback.match(/\\btry\\b\\s*$/);
        <span class="syntax-keyword">const</span> catchMatch = lookback.match(/\\bcatch\\b/);
        
        <span class="syntax-keyword">if</span> (classMatch) {
          type = <span class="syntax-string">"class_declaration"</span>;
          name = classMatch[<span class="syntax-number">1</span>];
        } <span class="syntax-keyword">else</span> <span class="syntax-keyword">if</span> (funcMatch) {
          type = <span class="syntax-string">"function_declaration"</span>;
          name = funcMatch[<span class="syntax-number">2</span>] || funcMatch[<span class="syntax-number">1</span>];
        } <span class="syntax-keyword">else</span> if (tryMatch) {
          type = <span class="syntax-string">"try_statement"</span>;
        } <span class="syntax-keyword">else</span> if (catchMatch) {
          type = <span class="syntax-string">"catch_clause"</span>;
        }
        
        stack.push({ type, startOffset: i, name });
        childrenMap[stack.length] = [];
        i++;
      } <span class="syntax-keyword">else</span> if (char === <span class="syntax-string">"}"</span>) {
        <span class="syntax-keyword">const</span> popped = stack.pop();
        <span class="syntax-keyword">if</span> (popped) {
          <span class="syntax-keyword">const</span> node: <span class="syntax-type">ASTNode</span> = {
            type: popped.type,
            startOffset: popped.startOffset,
            endOffset: i + <span class="syntax-number">1</span>,
            children: childrenMap[stack.length + <span class="syntax-number">1</span>] || []
          };
          <span class="syntax-keyword">const</span> depth = stack.length;
          <span class="syntax-keyword">if</span> (!childrenMap[depth]) {
            childrenMap[depth] = [];
          }
          childrenMap[depth].push(node);
        }
        i++;
      } <span class="syntax-keyword">else</span> {
        i++;
      }
    }
    root.children = childrenMap[<span class="syntax-number">0</span>] || [];
    <span class="syntax-keyword">return</span> root;
  }
}
</pre>`;

// 2. Upgrade GoalTreeManager and SandboxController in HTML
const upgradedGoalTreeManager = `<pre>
<span class="syntax-keyword">enum</span> <span class="syntax-type">GoalStatus</span> {
  PENDING = <span class="syntax-string">"PENDING"</span>,
  RUNNING = <span class="syntax-string">"RUNNING"</span>,
  SUCCESS = <span class="syntax-string">"SUCCESS"</span>,
  FAILED = <span class="syntax-string">"FAILED"</span>
}

<span class="syntax-keyword">interface</span> <span class="syntax-type">GoalNode</span> {
  id: <span class="syntax-type">string</span>;
  title: <span class="syntax-type">string</span>;
  status: <span class="syntax-type">GoalStatus</span>;
  subGoals: <span class="syntax-type">GoalNode</span>[];
  parent?: <span class="syntax-type">GoalNode</span>;
  visits: <span class="syntax-type">number</span>;      <span class="syntax-comment">// N_j: 节点访问频次</span>
  value: <span class="syntax-type">number</span>;       <span class="syntax-comment">// V_j: 质量分（测试通过率积累）</span>
  checkpointPath?: <span class="syntax-type">string</span>;
  errorTrace?: <span class="syntax-type">string</span>;
}

<span class="syntax-keyword">class</span> <span class="syntax-type">SandboxController</span> {
  <span class="syntax-keyword">private</span> layers = <span class="syntax-keyword">new</span> Map&lt;<span class="syntax-type">string</span>, { upper: { [path: <span class="syntax-type">string</span>]: <span class="syntax-type">string</span> }, deleted: <span class="syntax-type">Set</span>&lt;<span class="syntax-type">string</span>&gt; }&gt;();
  <span class="syntax-keyword">private</span> baseFS: { [path: <span class="syntax-type">string</span>]: <span class="syntax-type">string</span> } = {};

  <span class="syntax-keyword">constructor</span>(baseFiles: { [path: <span class="syntax-type">string</span>]: <span class="syntax-type">string</span> }) {
    <span class="syntax-keyword">this</span>.baseFS = baseFiles;
  }

  <span class="syntax-keyword">public</span> <span class="syntax-keyword">async</span> <span class="syntax-function">mountOverlayLayer</span>(nodeId: <span class="syntax-type">string</span>): <span class="syntax-type">Promise</span>&lt;<span class="syntax-type">string</span>&gt; {
    <span class="syntax-keyword">this</span>.layers.set(nodeId, { upper: {}, deleted: <span class="syntax-keyword">new</span> Set&lt;<span class="syntax-type">string</span>&gt;() });
    <span class="syntax-keyword">return</span> \`/sys/fs/overlay/checkpoints/\${nodeId}\`;
  }

  <span class="syntax-keyword">public</span> <span class="syntax-keyword">async</span> <span class="syntax-function">rollbackOverlayLayer</span>(checkpointPath: <span class="syntax-type">string</span>): <span class="syntax-type">Promise</span>&lt;<span class="syntax-type">void</span>&gt; {
    <span class="syntax-keyword">const</span> nodeId = checkpointPath.split(<span class="syntax-string">"/"</span>).pop();
    <span class="syntax-keyword">if</span> (nodeId) {
      <span class="syntax-keyword">this</span>.layers.delete(nodeId);
    }
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">writeFileSync</span>(nodeId: <span class="syntax-type">string</span>, filePath: <span class="syntax-type">string</span>, content: <span class="syntax-type">string</span>): <span class="syntax-type">void</span> {
    <span class="syntax-keyword">const</span> layer = <span class="syntax-keyword">this</span>.layers.get(nodeId);
    <span class="syntax-keyword">if</span> (layer) {
      layer.upper[filePath] = content;
      layer.deleted.delete(filePath);
    }
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">readFileSync</span>(nodeId: <span class="syntax-type">string</span>, filePath: <span class="syntax-type">string</span>): <span class="syntax-type">string</span> {
    <span class="syntax-keyword">const</span> layer = <span class="syntax-keyword">this</span>.layers.get(nodeId);
    <span class="syntax-keyword">if</span> (layer && layer.upper[filePath] !== undefined) {
      <span class="syntax-keyword">return</span> layer.upper[filePath];
    }
    <span class="syntax-keyword">if</span> (layer && layer.deleted.has(filePath)) {
      <span class="syntax-keyword">throw</span> <span class="syntax-keyword">new</span> Error(<span class="syntax-string">"File not found"</span>);
    }
    <span class="syntax-keyword">return</span> <span class="syntax-keyword">this</span>.baseFS[filePath] || <span class="syntax-string">""</span>;
  }

  <span class="syntax-keyword">public</span> <span class="syntax-keyword">async</span> <span class="syntax-function">runJestTests</span>(nodeId: <span class="syntax-type">string</span>): <span class="syntax-type">Promise</span>&lt;{ success: <span class="syntax-type">boolean</span>; score: <span class="syntax-type">number</span>; stderr?: <span class="syntax-type">string</span> }&gt; {
    <span class="syntax-keyword">const</span> managerFile = <span class="syntax-keyword">this</span>.readFileSync(nodeId, <span class="syntax-string">"/src/auth/UserSessionManager.ts"</span>);
    
    <span class="syntax-keyword">if</span> (managerFile.includes(\`listener.off("expire")\`) && managerFile.includes(\`?.off\`)) {
      <span class="syntax-keyword">return</span> { success: <span class="syntax-number">true</span>, score: <span class="syntax-number">1.0</span> };
    } <span class="syntax-keyword">else</span> if (managerFile.includes(\`listener.off("expire")\`)) {
      <span class="syntax-keyword">return</span> {
        success: <span class="syntax-number">false</span>,
        score: <span class="syntax-number">0.4</span>,
        stderr: <span class="syntax-string">"TypeError: Cannot read properties of undefined (reading 'off')\\n    at UserSessionManager.destroySession (UserSessionManager.ts:45:16)"</span>
      };
    }
    <span class="syntax-keyword">return</span> {
      success: <span class="syntax-number">false</span>,
      score: <span class="syntax-number">0.1</span>,
      stderr: <span class="syntax-string">"AssertionError: expected session reference to be cleared (Event Bus Leak Detected)"</span>
    };
  }
}

<span class="syntax-keyword">class</span> <span class="syntax-type">GoalTreeManager</span> {
  <span class="syntax-keyword">private</span> root: <span class="syntax-type">GoalNode</span>;
  <span class="syntax-keyword">private</span> backtrackingStack: <span class="syntax-type">GoalNode</span>[] = [];
  <span class="syntax-keyword">private</span> <span class="syntax-keyword">readonly</span> UCB_EXPLORE_CONSTANT = <span class="syntax-number">1.414</span>;

  <span class="syntax-keyword">constructor</span>(rootTask: <span class="syntax-type">string</span>) {
    <span class="syntax-keyword">this</span>.root = {
      id: <span class="syntax-string">"root"</span>, title: rootTask, status: <span class="syntax-type">GoalStatus</span>.PENDING,
      subGoals: [], visits: <span class="syntax-number">0</span>, value: <span class="syntax-number">0</span>
    };
  }

  <span class="syntax-comment">/**
   * 1. 蒙特卡洛 UCB1 选择决策 (MCTS Node Selection)
   * UCB1(j) = V_j / N_j + C * sqrt( ln(N_parent) / N_j )
   */</span>
  <span class="syntax-keyword">public</span> <span class="syntax-function">selectBestNode</span>(parent: <span class="syntax-type">GoalNode</span>): <span class="syntax-type">GoalNode</span> {
    <span class="syntax-keyword">if</span> (parent.subGoals.length === <span class="syntax-number">0</span>) <span class="syntax-keyword">return</span> parent;

    <span class="syntax-keyword">let</span> bestNode = parent.subGoals[<span class="syntax-number">0</span>];
    <span class="syntax-keyword">let</span> maxScore = -<span class="syntax-keyword">Infinity</span>;

    <span class="syntax-keyword">for</span> (<span class="syntax-keyword">const</span> node <span class="syntax-keyword">of</span> parent.subGoals) {
      <span class="syntax-keyword">if</span> (node.visits === <span class="syntax-number">0</span>) {
        <span class="syntax-keyword">return</span> node; 
      }
      <span class="syntax-keyword">const</span> exploitation = node.value / node.visits;
      <span class="syntax-keyword">const</span> exploration = <span class="syntax-keyword">this</span>.UCB_EXPLORE_CONSTANT * Math.sqrt(Math.log(parent.visits) / node.visits);
      <span class="syntax-keyword">const</span> ucb1 = exploitation + exploration;

      <span class="syntax-keyword">if</span> (ucb1 &gt; maxScore) {
        maxScore = ucb1;
        bestNode = node;
      }
    }
    <span class="syntax-keyword">return</span> <span class="syntax-keyword">this</span>.selectBestNode(bestNode);
  }

  <span class="syntax-comment">/**
   * 2. OverlayFS 物理沙箱挂载与反馈对齐执行
   */</span>
  <span class="syntax-keyword">public</span> <span class="syntax-keyword">async</span> <span class="syntax-function">executeNode</span>(node: <span class="syntax-type">GoalNode</span>, sandboxController: <span class="syntax-type">SandboxController</span>): <span class="syntax-type">Promise</span>&lt;<span class="syntax-type">boolean</span>&gt; {
    node.status = <span class="syntax-type">GoalStatus</span>.RUNNING;
    node.visits++;

    node.checkpointPath = <span class="syntax-keyword">await</span> sandboxController.mountOverlayLayer(node.id);
    <span class="syntax-keyword">this</span>.backtrackingStack.push(node);

    <span class="syntax-keyword">const</span> { success, score, stderr } = <span class="syntax-keyword">await</span> sandboxController.runJestTests(node.id);
    node.value += score;

    <span class="syntax-keyword">if</span> (success) {
      node.status = <span class="syntax-type">GoalStatus</span>.SUCCESS;
      <span class="syntax-keyword">this</span>.backtrackingStack.pop();
      <span class="syntax-keyword">return</span> <span class="syntax-number">true</span>;
    } <span class="syntax-keyword">else</span> {
      node.errorTrace = stderr;
      <span class="syntax-keyword">return</span> <span class="syntax-keyword">await</span> <span class="syntax-keyword">this</span>.backtrack(node, sandboxController);
    }
  }

  <span class="syntax-comment">/**
   * 3. 动态回溯算法与逆向价值惩罚传播 (Dynamic Backpropagation)
   */</span>
  <span class="syntax-keyword">private</span> <span class="syntax-keyword">async</span> <span class="syntax-function">backtrack</span>(failedNode: <span class="syntax-type">GoalNode</span>, sandboxController: <span class="syntax-type">SandboxController</span>): <span class="syntax-type">Promise</span>&lt;<span class="syntax-type">boolean</span>&gt; {
    failedNode.status = <span class="syntax-type">GoalStatus</span>.FAILED;

    <span class="syntax-keyword">let</span> curr = failedNode.parent;
    <span class="syntax-keyword">while</span> (curr) {
      curr.value -= <span class="syntax-number">0.35</span>;
      curr = curr.parent;
    }

    <span class="syntax-keyword">const</span> lastNode = <span class="syntax-keyword">this</span>.backtrackingStack.pop();
    <span class="syntax-keyword">if</span> (lastNode && lastNode.checkpointPath) {
      <span class="syntax-keyword">await</span> sandboxController.rollbackOverlayLayer(lastNode.checkpointPath);

      <span class="syntax-keyword">const</span> altNode: <span class="syntax-type">GoalNode</span> = {
        id: \`\${failedNode.id}_alt_\${Date.now()}\`,
        title: \`备选自愈分支：针对 [\${failedNode.title}] 的 Type-Error 执行可选链适配\`,
        status: <span class="syntax-type">GoalStatus</span>.PENDING,
        subGoals: [],
        parent: lastNode,
        visits: <span class="syntax-number">0</span>,
        value: <span class="syntax-number">0</span>
      };

      lastNode.subGoals.push(altNode);
      <span class="syntax-keyword">return</span> <span class="syntax-keyword">await</span> <span class="syntax-keyword">this</span>.executeNode(altNode, sandboxController);
    }
    <span class="syntax-keyword">return</span> <span class="syntax-number">false</span>;
  }
}
</pre>`;

// Replace ShadowMergeEngine in code_agent_evolution.html
console.log('Replacing ShadowMergeEngine block...');
const startSm = html.indexOf('<pre>\n<span class="syntax-keyword">interface</span> <span class="syntax-type">EditPatch</span> {');
const endSm = html.indexOf('}\n</pre>\n                        </div>\n                    </div>\n\n                    <!-- Goal Trees 多叉树回溯算法 -->');
if (startSm !== -1 && endSm !== -1) {
    const endOffset = endSm + '}\n</pre>'.length;
    const targetString = html.substring(startSm, endOffset);
    html = html.replace(targetString, upgradedShadowMergeEngine);
    console.log('✓ Replaced ShadowMergeEngine successfully.');
} else {
    // Fallback: search-replace using index matching
    const fallbackStart = html.indexOf('interface EditPatch {');
    const fallbackEnd = html.indexOf('class ShadowMergeEngine {');
    console.log(`ShadowMergeEngine boundary index: start=${startSm}, end=${endSm}, fbStart=${fallbackStart}, fbEnd=${fallbackEnd}`);
    if (fallbackStart !== -1) {
        console.error('✗ Boundary check failed but interface found. Let\'s use a precise regex replace for ShadowMergeEngine.');
    }
}

// Replace GoalTreeManager in code_agent_evolution.html
console.log('Replacing GoalTreeManager block...');
const startGt = html.indexOf('<pre>\n<span class="syntax-keyword">enum</span> <span class="syntax-type">GoalStatus</span> {');
const endGt = html.indexOf('}\n</pre>\n                        </div>\n                    </div>\n                </div>\n            </section>\n\n            <!-- 第五部分：终极对比矩阵 -->');
if (startGt !== -1 && endGt !== -1) {
    const endOffset = endGt + '}\n</pre>'.length;
    const targetString = html.substring(startGt, endOffset);
    html = html.replace(targetString, upgradedGoalTreeManager);
    console.log('✓ Replaced GoalTreeManager successfully.');
} else {
    console.log(`✗ GoalTreeManager boundary index: start=${startGt}, end=${endGt}`);
}

// 3. Upgrading techDetails object
// Let's locate 'const techDetails = {' and extract it dynamically to replace with our updated high-rigour specifications.
const startTechDetailsIdx = html.indexOf('const techDetails = {');
// Find the closing brace of techDetails before 'function openDrawer(techKey) {'
const endTechDetailsIdx = html.indexOf('// 打开抽屉\n        function openDrawer(techKey) {');

if (startTechDetailsIdx !== -1 && endTechDetailsIdx !== -1) {
    console.log('Replacing techDetails data object...');
    
    // We will build a highly rigorous systems specification object
    const systemsTechDetails = `const techDetails = {
            mcp: {
                title: "Model Context Protocol (MCP) v1.0 协议物理架构与双向时序规格",
                subtitle: "标准化上下文与系统交互原语 (RFC-409)",
                content: \`
                    <div class="drawer-section">
                        <p class="drawer-desc">
                            <b>Model Context Protocol (MCP)</b> 是一个开放的、主从架构的异步 JSON-RPC 2.0 通信协议规范。它为大型语言模型提供了一套类似于 <b>LSP (Language Server Protocol)</b> 的环境交互标准。通过建立标准的 <code>stdin/stdout</code> 双向无损通道或 Web <code>SSE (Server-Sent Events)</code> 传输层，MCP 彻底杜绝了工具集爆炸引发的上下文碎片化和物理系统安全穿透隐患。
                        </p>
                    </div>
                    
                    <div class="drawer-section">
                        <h4 class="drawer-section-title">一、 物理架构：Host - Client - Server 三层拓扑</h4>
                        <div class="svg-container">
                            <svg class="svg-flow" width="650" height="240" viewBox="0 0 650 240" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100%" height="100%" fill="rgba(255,255,255,0.01)" rx="8" />
                                <rect x="20" y="50" width="160" height="130" rx="10" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" stroke-width="1.5"/>
                                <text x="100" y="90" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">Agent Host (CLI)</text>
                                <rect x="35" y="120" width="130" height="35" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)"/>
                                <text x="100" y="142" fill="#cbd5e1" font-size="10" text-anchor="middle">MCP Client Engine</text>

                                <path d="M 180 90 L 300 90" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="4 4" />
                                <path d="M 300 130 L 180 130" stroke="#10b981" stroke-width="1.5" />
                                <text x="240" y="80" fill="#06b6d4" font-size="9" text-anchor="middle">JSON-RPC Call</text>
                                <text x="240" y="150" fill="#10b981" font-size="9" text-anchor="middle">Typed Response</text>

                                <rect x="300" y="50" width="160" height="130" rx="10" fill="rgba(6, 182, 212, 0.1)" stroke="#06b6d4" stroke-width="1.5"/>
                                <text x="380" y="90" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">MCP Server</text>
                                <rect x="315" y="120" width="130" height="35" rx="5" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)"/>
                                <text x="380" y="142" fill="#cbd5e1" font-size="10" text-anchor="middle">JSON-RPC Router</text>

                                <path d="M 460 115 L 520 115" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
                                <rect x="520" y="50" width="110" height="130" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)"/>
                                <text x="575" y="90" fill="#cbd5e1" font-size="10" text-anchor="middle">1. Git FS Tool</text>
                                <text x="575" y="115" fill="#cbd5e1" font-size="10" text-anchor="middle">2. PG Database</text>
                                <text x="575" y="140" fill="#cbd5e1" font-size="10" text-anchor="middle">3. Dev Sandbox</text>
                            </svg>
                        </div>
                        <p>MCP 规范通过严谨的接口抽象，将 LLM 推理层、运行脚手架与物理系统深度解耦：</p>
                        <ul>
                            <li><b>Host (智能体宿主)</b>: 控制 Agent 规划主线程的系统（如 Claude Code CLI, Antigravity CLI）。它负责调用大模型、组装 Prompt，并在检测到 Tool Call 时，将任务分发给内部的 MCP Client。</li>
                            <li><b>Client (协议客户端)</b>: Host 内部集成的协议编排组件，负责建立长连接、生命周期握手及 JSON-RPC 报文的双向解析与传输校验。</li>
                            <li><b>Server (轻量级服务单元)</b>: 本地常驻子进程或远程微服务，向 Client 动态暴露 Resources, Prompts, Tools 三大类标准化接口。</li>
                        </ul>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">二、 MCP 通信内核与 JSON-RPC 2.0 报文协议规范</h4>
                        <p>MCP 物理传输层通常使用标准的 Content-Length 分隔长文本流，与 LSP 规范高度一致。以下展示 Host 通过 Client 请求列举可用工具（<code>tools/list</code>）与 Server 返回的真实 JSON-RPC 报文：</p>
                        
                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">JSON (JSON-RPC)</span>
                                <span>1. Host 发起 tools/list 发现请求</span>
                            </div>
                            <pre>
{
  "<span class="syntax-keyword">jsonrpc</span>": "<span class="syntax-string">2.0</span>",
  "<span class="syntax-keyword">id</span>": <span class="syntax-number">101</span>,
  "<span class="syntax-keyword">method</span>": "<span class="syntax-string">tools/list</span>",
  "<span class="syntax-keyword">params</span>": {}
}</pre>
                        </div>

                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">JSON (JSON-RPC)</span>
                                <span>2. Server 返回结构化 Tool 约束 Schema</span>
                            </div>
                            <pre>
{
  "<span class="syntax-keyword">jsonrpc</span>": "<span class="syntax-string">2.0</span>",
  "<span class="syntax-keyword">id</span>": <span class="syntax-number">101</span>,
  "<span class="syntax-keyword">result</span>": {
    "<span class="syntax-keyword">tools</span>": [
      {
        "<span class="syntax-keyword">name</span>": "<span class="syntax-string">execute_bash_command</span>",
        "<span class="syntax-keyword">description</span>": "<span class="syntax-string">Run arbitrary shell commands inside the safe virtualization sandbox.</span>",
        "<span class="syntax-keyword">inputSchema</span>": {
          "<span class="syntax-keyword">type</span>": "<span class="syntax-string">object</span>",
          "<span class="syntax-keyword">properties</span>": {
            "<span class="syntax-keyword">command</span>": { "<span class="syntax-keyword">type</span>": "<span class="syntax-string">string</span>" },
            "<span class="syntax-keyword">timeout</span>": { "<span class="syntax-keyword">type</span>": "<span class="syntax-string">number</span>", "<span class="syntax-keyword">default</span>": <span class="syntax-number">10000</span> }
          },
          "<span class="syntax-keyword">required</span>": ["<span class="syntax-keyword">command</span>"]
        }
      }
    ]
  }
}</pre>
                        </div>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">三、 生产级 Host-Client-Server stdio 多路复用器通信模块实现</h4>
                        <p>以下是使用纯 TypeScript / Node.js 物理还原的轻量级无阻塞 stdio 协议帧读取与解析器，支持 Content-Length 头部粘包处理与 JSON-RPC 分发：</p>
                        
                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">TypeScript</span>
                                <span>MCPLinkTransport.ts</span>
                            </div>
                            <pre>
<span class="syntax-keyword">import</span> { spawn, ChildProcess } <span class="syntax-keyword">from</span> <span class="syntax-string">"child_process"</span>;
<span class="syntax-keyword">import</span> { EventEmitter } <span class="syntax-keyword">from</span> <span class="syntax-string">"events"</span>;

<span class="syntax-keyword">export</span> <span class="syntax-keyword">class</span> <span class="syntax-type">MCPLinkTransport</span> <span class="syntax-keyword">extends</span> <span class="syntax-type">EventEmitter</span> {
  <span class="syntax-keyword">private</span> child: <span class="syntax-type">ChildProcess</span>;
  <span class="syntax-keyword">private</span> buffer: <span class="syntax-type">Buffer</span> = Buffer.alloc(<span class="syntax-number">0</span>);

  <span class="syntax-keyword">constructor</span>(serverScriptPath: <span class="syntax-type">string</span>) {
    <span class="syntax-keyword">super</span>();
    <span class="syntax-keyword">this</span>.child = spawn(<span class="syntax-string">"node"</span>, [serverScriptPath], {
      stdio: [<span class="syntax-string">"pipe"</span>, <span class="syntax-string">"pipe"</span>, <span class="syntax-string">"inherit"</span>]
    });
    <span class="syntax-keyword">this</span>.child.stdout!.on(<span class="syntax-string">"data"</span>, (chunk: <span class="syntax-type">Buffer</span>) =&gt; <span class="syntax-keyword">this</span>.handleInput(chunk));
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">send</span>(method: <span class="syntax-type">string</span>, params: <span class="syntax-type">any</span>, id: <span class="syntax-type">number</span>): <span class="syntax-type">void</span> {
    <span class="syntax-keyword">const</span> payload = JSON.stringify({ jsonrpc: <span class="syntax-string">"2.0"</span>, id, method, params });
    <span class="syntax-keyword">const</span> header = \`Content-Length: \${Buffer.byteLength(payload)}\\r\\n\\r\\n\`;
    <span class="syntax-keyword">this</span>.child.stdin!.write(header + payload);
  }

  <span class="syntax-keyword">private</span> <span class="syntax-function">handleInput</span>(chunk: <span class="syntax-type">Buffer</span>): <span class="syntax-type">void</span> {
    <span class="syntax-keyword">this</span>.buffer = Buffer.concat([<span class="syntax-keyword">this</span>.buffer, chunk]);
    <span class="syntax-keyword">while</span> (<span class="syntax-number">true</span>) {
      <span class="syntax-keyword">const</span> bufferStr = <span class="syntax-keyword">this</span>.buffer.toString(<span class="syntax-string">"utf8"</span>);
      <span class="syntax-keyword">const</span> headerMatch = bufferStr.match(/^Content-Length:\\s*(\\d+)\\r\\n\\r\\n/);
      <span class="syntax-keyword">if</span> (!headerMatch) <span class="syntax-keyword">break</span>;

      <span class="syntax-keyword">const</span> headerLength = headerMatch[<span class="syntax-number">0</span>].length;
      <span class="syntax-keyword">const</span> contentLength = parseInt(headerMatch[<span class="syntax-number">1</span>], <span class="syntax-number">10</span>);

      <span class="syntax-keyword">if</span> (<span class="syntax-keyword">this</span>.buffer.length &lt; headerLength + contentLength) <span class="syntax-keyword">break</span>;

      <span class="syntax-keyword">const</span> bodyStart = headerLength;
      <span class="syntax-keyword">const</span> bodyEnd = headerLength + contentLength;
      <span class="syntax-keyword">const</span> rawBody = <span class="syntax-keyword">this</span>.buffer.slice(bodyStart, bodyEnd).toString(<span class="syntax-string">"utf8"</span>);

      <span class="syntax-keyword">try</span> {
        <span class="syntax-keyword">const</span> parsed = JSON.parse(rawBody);
        <span class="syntax-keyword">this</span>.emit(<span class="syntax-string">"message"</span>, parsed);
      } <span class="syntax-keyword">catch</span> (err) {
        <span class="syntax-keyword">this</span>.emit(<span class="syntax-string">"error"</span>, err);
      }

      <span class="syntax-keyword">this</span>.buffer = <span class="syntax-keyword">this</span>.buffer.slice(bodyEnd);
    }
  }
}</pre>
                        </div>
                    </div>
                \`
            },
            skills: {
                title: "动态 SKILLS 按需路由与 KV 硬件缓存对齐",
                subtitle: "KV Cache Block Alignment 硬件对齐与 TF-IDF 相似度路由",
                content: \`
                    <div class="drawer-section">
                        <p class="drawer-desc">
                            在超大规模项目中，将数百个 MCP API 的 inputSchema 粗暴拼装进 System Prompt 会导致大模型注意力严重稀释，且单次轮询的 Token 成本飙升。现代智能体核心包含 <b>Dynamic Skills Router</b> 机制，利用前序文本语义进行动态渐进式 Disclosure；结合硬件底层<b>缓存前缀对齐（KV Cache Block Alignment）</b>将轮询延迟削减一个数量级。
                        </p>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">一、 KV Cache Block Alignment 硬件对齐物理逻辑</h4>
                        <p>云端 GPU 物理集群（如 NVIDIA H100 架构）在运行 PagedAttention 时，会对 KV 缓存进行分块映射（物理 Block 通常对齐为 1024 / 2048 词元边界）。为了促使每次 PTY 交互时均能命中云端硬件 Cache：</p>
                        <ul>
                            <li><b>前缀填充对齐 (Prefix Padding Alignment)</b>: Agent 的 Prompt Engine 绝不使用动态变化的时间戳作为最头部前缀。系统在拼接 System Prompt、MCP 声明后，精确测算词元长度，利用硬空白占位符（Whitespace Padding）将静态信息截断填充至 2048 Tokens 整数倍。</li>
                            <li><b>渐进披露 (Progressive Schema Disclosure)</b>: 主推理栈建立 Skills 检索矩阵。当检测到当前任务仅涉及“编译调试”时，智能体过滤掉“数据库”、“文件查询”等 80% 的工具 Schema，仅暴露受限子集，确保被激活工具信息牢牢锁死在 KV 缓存层。</li>
                            <li><b>TTL 逐出机制 (TTL Eviction)</b>: 为激活的临时 Skills 工具库分配 300 秒生命期。一旦发生任务降级，触发 TTL 自动剪枝注销，回收物理 Token 窗口。</li>
                        </ul>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">二、 动态技能按需注册与 TF-IDF 余弦相似度路由引擎实现</h4>
                        <p>以下为基于 TF-IDF 词汇向量相似度度量（Cosine Similarity）与按需注册机制的 SkillsRouter 物理还原实现：</p>
                        
                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">TypeScript</span>
                                <span>SkillsRouter.ts</span>
                            </div>
                            <pre>
<span class="syntax-keyword">interface</span> <span class="syntax-type">SkillDefinition</span> {
  name: <span class="syntax-type">string</span>;
  tags: <span class="syntax-type">string</span>[];
  schema: <span class="syntax-type">object</span>;
  ttlMs: <span class="syntax-type">number</span>;
}

<span class="syntax-keyword">export</span> <span class="syntax-keyword">class</span> <span class="syntax-type">SkillsRouter</span> {
  <span class="syntax-keyword">private</span> registry = <span class="syntax-keyword">new</span> Map&lt;<span class="syntax-type">string</span>, { skill: <span class="syntax-type">SkillDefinition</span>, expiry: <span class="syntax-type">number</span> }&gt;();

  <span class="syntax-keyword">public</span> <span class="syntax-function">registerSkill</span>(skill: <span class="syntax-type">SkillDefinition</span>): <span class="syntax-type">void</span> {
    <span class="syntax-keyword">this</span>.registry.set(skill.name, {
      skill,
      expiry: Date.now() + skill.ttlMs
    });
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">getActiveSkillsForTask</span>(taskQuery: <span class="syntax-type">string</span>): <span class="syntax-type">SkillDefinition</span>[] {
    <span class="syntax-keyword">this</span>.evictExpiredSkills();
    <span class="syntax-keyword">const</span> queryTerms = <span class="syntax-keyword">this</span>.tokenize(taskQuery);
    <span class="syntax-keyword">if</span> (queryTerms.length === <span class="syntax-number">0</span>) <span class="syntax-keyword">return</span> [];

    <span class="syntax-keyword">const</span> scores: { skill: <span class="syntax-type">SkillDefinition</span>; score: <span class="syntax-type">number</span> }[] = [];

    <span class="syntax-keyword">for</span> (<span class="syntax-keyword">const</span> [name, entry] <span class="syntax-keyword">of</span> <span class="syntax-keyword">this</span>.registry.entries()) {
      <span class="syntax-keyword">const</span> skillText = entry.skill.tags.join(<span class="syntax-string">" "</span>) + <span class="syntax-string">" "</span> + entry.skill.name;
      <span class="syntax-keyword">const</span> skillTerms = <span class="syntax-keyword">this</span>.tokenize(skillText);

      <span class="syntax-keyword">const</span> score = <span class="syntax-keyword">this</span>.cosineSimilarity(queryTerms, skillTerms);
      <span class="syntax-keyword">if</span> (score &gt;= <span class="syntax-number">0.15</span>) {
        scores.push({ skill: entry.skill, score });
      }
    }

    scores.sort((a, b) =&gt; b.score - a.score);
    <span class="syntax-keyword">return</span> scores.map(s =&gt; s.skill);
  }

  <span class="syntax-keyword">private</span> <span class="syntax-function">tokenize</span>(text: <span class="syntax-type">string</span>): <span class="syntax-type">string</span>[] {
    <span class="syntax-keyword">return</span> text.toLowerCase()
      .replace(/[^a-z0-9\\s]/g, <span class="syntax-string">""</span>)
      .split(/\\s+/)
      .filter(t =&gt; t.length &gt; <span class="syntax-number">1</span>);
  }

  <span class="syntax-keyword">private</span> <span class="syntax-function">cosineSimilarity</span>(vecA: <span class="syntax-type">string</span>[], vecB: <span class="syntax-type">string</span>[]): <span class="syntax-type">number</span> {
    <span class="syntax-keyword">const</span> tfA: { [word: <span class="syntax-type">string</span>]: <span class="syntax-type">number</span> } = {};
    <span class="syntax-keyword">const</span> tfB: { [word: <span class="syntax-type">string</span>]: <span class="syntax-type">number</span> } = {};
    <span class="syntax-keyword">const</span> allWords = <span class="syntax-keyword">new</span> Set&lt;<span class="syntax-type">string</span>&gt;();

    vecA.forEach(w =&gt; { tfA[w] = (tfA[w] || <span class="syntax-number">0</span>) + <span class="syntax-number">1</span>; allWords.add(w); });
    vecB.forEach(w =&gt; { tfB[w] = (tfB[w] || <span class="syntax-number">0</span>) + <span class="syntax-number">1</span>; allWords.add(w); });

    <span class="syntax-keyword">let</span> dotProduct = <span class="syntax-number">0</span>;
    <span class="syntax-keyword">let</span> normA = <span class="syntax-number">0</span>;
    <span class="syntax-keyword">let</span> normB = <span class="syntax-number">0</span>;

    allWords.forEach(w =&gt; {
      <span class="syntax-keyword">const</span> a = tfA[w] || <span class="syntax-number">0</span>;
      <span class="syntax-keyword">const</span> b = tfB[w] || <span class="syntax-number">0</span>;
      dotProduct += a * b;
    });

    Object.values(tfA).forEach(val =&gt; normA += val * val);
    Object.values(tfB).forEach(val =&gt; normB += val * val);

    <span class="syntax-keyword">if</span> (normA === <span class="syntax-number">0</span> || normB === <span class="syntax-number">0</span>) <span class="syntax-keyword">return</span> <span class="syntax-number">0</span>;
    <span class="syntax-keyword">return</span> dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  <span class="syntax-keyword">private</span> <span class="syntax-function">evictExpiredSkills</span>(): <span class="syntax-type">void</span> {
    <span class="syntax-keyword">const</span> now = Date.now();
    <span class="syntax-keyword">for</span> (<span class="syntax-keyword">const</span> [name, entry] <span class="syntax-keyword">of</span> <span class="syntax-keyword">this</span>.registry.entries()) {
      <span class="syntax-keyword">if</span> (now &gt; entry.expiry) {
        <span class="syntax-keyword">this</span>.registry.delete(name);
      }
    }
  }
}</pre>
                        </div>
                    </div>
                \`
            },
            subagent: {
                title: "SubAgent 派生状态机与 Linux namespace 隔离物理沙箱",
                subtitle: "unshare 空间隔离、cgroups v2 物理约束与 seccomp 系统调用拦截",
                content: \`
                    <div class="drawer-section">
                        <p class="drawer-desc">
                            当主 Agent 规划进行重度重构时（例如跨模块重构），系统会派生（Fork）一个或多个 SubAgent 执行底层调研、或者并行编码，随后将几百页的细节数据蒸馏成干净的 AST state 提交给主进程。这要求派生的 SubAgent 必须拥有绝对安全的<b>物理隔离沙箱环境</b>，防止恶性代码执行带来的主机穿透。
                        </p>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">一、 Linux 沙箱隔离核心系统原语规格</h4>
                        <p>为保障沙箱的物理防线，智能体引擎不使用简单的 Docker exec，而是直接操控内核 Linux API：</p>
                        <ul>
                            <li><b>进程空间隔离 (unshare namespace)</b>: 利用 <code>CLONE_NEWPID</code>、<code>CLONE_NEWNET</code>、<code>CLONE_NEWNS</code>，执行 unshare 系统调用，将子进程的 PID 拓扑、网卡路由与物理根挂载树一键斩断，形成零共享沙盒环境。</li>
                            <li><b>内核系统调用过滤 (seccomp)</b>: 基于 Berkley Packet Filter (BPF) 建立硬拦截白名单。强制拒绝 <code>sys_reboot</code>、<code>sys_mount</code>、<code>ptrace</code> 等危险指令，对物理主机调用进行拦截隔离。</li>
                            <li><b>cgroups v2 资源硬限控制 (Control Groups)</b>: 在 <code>/sys/fs/cgroup/agent_sub/</code> 路径写入物理硬阈值，对子进程树进行硬性截断制约，杜绝内存溢出。
                                <div class="code-container" style="margin-top: 0.5rem; margin-bottom: 0.5rem; background: rgba(0,0,0,0.4);">
                                    <pre style="font-size:10px;">
echo "157286400" > /sys/fs/cgroup/agent_sub/memory.max  # 锁定 subagent 物理内存最大 150MB
echo "40000 100000" > /sys/fs/cgroup/agent_sub/cpu.max  # 限制 CPU 使用率最高不超过 40%</pre>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">二、 SubAgent 编译隔离与 sandbox 初始化 TS 代码实现</h4>
                        <p>以下为 Node.js 内部派生 SubAgent 并强行注入 cgroups 资源组与 Linux unshare 隔离的底层模块还原：</p>
                        
                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">TypeScript</span>
                                <span>SubAgentSandboxOrchestrator.ts</span>
                            </div>
                            <pre>
<span class="syntax-keyword">import</span> { execSync, spawn } <span class="syntax-keyword">from</span> <span class="syntax-string">"child_process"</span>;
<span class="syntax-keyword">import</span> * <span class="syntax-keyword">as</span> fs <span class="syntax-keyword">from</span> <span class="syntax-string">"fs"</span>;

<span class="syntax-keyword">export</span> <span class="syntax-keyword">class</span> <span class="syntax-type">SubAgentSandboxOrchestrator</span> {
  <span class="syntax-keyword">private</span> cgroupPath = <span class="syntax-string">"/sys/fs/cgroup/agent_sub"</span>;

  <span class="syntax-keyword">constructor</span>() {
    <span class="syntax-keyword">if</span> (!fs.existsSync(<span class="syntax-keyword">this</span>.cgroupPath)) {
      execSync(\`sudo mkdir -p \${<span class="syntax-keyword">this</span>.cgroupPath}\`);
      execSync(\`echo "157286400" | sudo tee \${<span class="syntax-keyword">this</span>.cgroupPath}/memory.max\`);
      execSync(\`echo "40000 100000" | sudo tee \${<span class="syntax-keyword">this</span>.cgroupPath}/cpu.max\`);
    }
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">spawnSubAgent</span>(args: <span class="syntax-type">string</span>[]) {
    <span class="syntax-keyword">const</span> sandbox = spawn(<span class="syntax-string">"unshare"</span>, [
      <span class="syntax-string">"--pid"</span>, <span class="syntax-string">"--net"</span>, <span class="syntax-string">"--mount"</span>, <span class="syntax-string">"--fork"</span>,
      <span class="syntax-string">"bash"</span>, <span class="syntax-string">"-c"</span>, \`echo \$\$ &gt; \${<span class="syntax-keyword">this</span>.cgroupPath}/cgroup.procs && node subagent_entry.js \${args.join(" ")}\`
    ], {
      stdio: [<span class="syntax-string">"pipe"</span>, <span class="syntax-string">"pipe"</span>, <span class="syntax-string">"pipe"</span>]
    });

    sandbox.on(<span class="syntax-string">"spawn"</span>, () =&gt; {
      console.log(\`[Sandbox] SubAgent 隔离进程树成功拉起并在 cgroups 锁定中...\`);
    });

    <span class="syntax-keyword">return</span> sandbox;
  }
}</pre>
                        </div>
                    </div>
                \`
            },
            mem: {
                title: "分层持久化 Memory 与 Vector-AST 混合 RAG",
                subtitle: "长期 Memory 空间中的 Vector-AST 依赖拓扑混合 RAG 算法与 BFS/RRF 融合模型",
                content: \`
                    <div class="drawer-section">
                        <p class="drawer-desc">
                            Transformer 模型的无状态性决定了智能体必须具备高鲁棒的分层存储结构。传统的向量 RAG 忽视了代码强关联的调用树层级与控制边（Control Flow Edge），导致生成充斥着编译缺陷。本章节详细解析<b>长期 Memory 空间中的 Vector-AST 依赖拓扑混合 RAG 算法与 BFS/RRF 融合模型</b>。
                        </p>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">一、 混合 RAG 设计机制与核心数学模型描述</h4>
                        <p>当开发者输入意图查询为 $Q$ 时，混合 RAG 进行双路并发寻址，消除信息断流：</p>
                        <ol>
                            <li><b>向量词义相似度 (Vector Semantic Search)</b>: 将 query $Q$ 编码为高维向量 $\mathbf{u}$，计算与代码块向量 $\mathbf{v}_i$ 的余弦相似度：
                                <div style="text-align: center; margin: 0.5rem 0;">
                                    $$Sim(Q, C_i) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}_i}{\\|\\mathbf{u}\\| \\|\\mathbf{v}_i\\|}$$
                                </div>
                            </li>
                            <li><b>AST 调用拓扑图邻接探查 (BFS)</b>: 在静态 symbol 依赖图 $G = (V, E)$ 中定位匹配的符号顶点，并沿着 caller-callee 或继承依赖边执行深度 $D \\le 2$ 的广度优先搜索 (BFS)，圈定邻接符号集合。</li>
                            <li><b>倒数排序融合 (Reciprocal Rank Fusion, RRF)</b>: 将两路集合融合以确保全局上下文不丢失，算式规约如下：
                                <div style="text-align: center; margin: 0.5rem 0;">
                                    $$RRF\\_Score(d) = \\sum_{m \\in \\{vec, ast\\}} \\frac{1}{k + rank_m(d)}$$
                                </div>
                                [注：其中 $k$ 为标准阻尼因子，工业级通常取 $k = 60$]
                            </li>
                        </ol>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">二、 Vector-AST 混合 RAG 检索引擎 TS 级工程还原</h4>
                        <p>以下为结合邻接图 BFS 遍历与 RRF 倒数排序融合的混合检索引擎完整 TS 实现：</p>
                        
                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">TypeScript</span>
                                <span>HybridRAGEngine.ts</span>
                            </div>
                            <pre>
<span class="syntax-keyword">interface</span> <span class="syntax-type">ASTGraphNode</span> {
  id: <span class="syntax-type">string</span>;
  type: <span class="syntax-type">string</span>;
  content: <span class="syntax-type">string</span>;
  dependencies: <span class="syntax-type">string</span>[]; 
}

<span class="syntax-keyword">export</span> <span class="syntax-keyword">class</span> <span class="syntax-type">HybridRAGEngine</span> {
  <span class="syntax-keyword">private</span> kDamp = <span class="syntax-number">60</span>;
  <span class="syntax-keyword">private</span> symbolGraph = <span class="syntax-keyword">new</span> Map&lt;<span class="syntax-type">string</span>, <span class="syntax-type">ASTGraphNode</span>&gt;();

  <span class="syntax-keyword">public</span> <span class="syntax-function">registerNode</span>(node: <span class="syntax-type">ASTGraphNode</span>): <span class="syntax-type">void</span> {
    <span class="syntax-keyword">this</span>.symbolGraph.set(node.id, node);
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">graphBFSSearch</span>(startNodeId: <span class="syntax-type">string</span>, maxDepth: <span class="syntax-type">number</span> = <span class="syntax-number">2</span>): <span class="syntax-type">ASTGraphNode</span>[] {
    <span class="syntax-keyword">const</span> visited = <span class="syntax-keyword">new</span> Set&lt;<span class="syntax-type">string</span>&gt;();
    <span class="syntax-keyword">const</span> queue: { id: <span class="syntax-type">string</span>; depth: <span class="syntax-type">number</span> }[] = [{ id: startNodeId, depth: <span class="syntax-number">0</span> }];
    <span class="syntax-keyword">const</span> results: <span class="syntax-type">ASTGraphNode</span>[] = [];

    <span class="syntax-keyword">while</span> (queue.length &gt; <span class="syntax-number">0</span>) {
      <span class="syntax-keyword">const</span> curr = queue.shift()!;
      <span class="syntax-keyword">if</span> (visited.has(curr.id) || curr.depth &gt; maxDepth) <span class="syntax-keyword">continue</span>;
      visited.add(curr.id);

      <span class="syntax-keyword">const</span> node = <span class="syntax-keyword">this</span>.symbolGraph.get(curr.id);
      <span class="syntax-keyword">if</span> (node) {
        results.push(node);
        node.dependencies.forEach(depId =&gt; {
          <span class="syntax-keyword">if</span> (!visited.has(depId)) {
            queue.push({ id: depId, depth: curr.depth + <span class="syntax-number">1</span> });
          }
        });
      }
    }
    <span class="syntax-keyword">return</span> results;
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">reciprocalRankFusion</span>(
    vecResults: { docId: <span class="syntax-type">string</span>; content: <span class="syntax-type">string</span> }[], 
    astResults: { docId: <span class="syntax-type">string</span>; content: <span class="syntax-type">string</span> }[]
  ): { docId: <span class="syntax-type">string</span>; content: <span class="syntax-type">string</span>; score: <span class="syntax-type">number</span> }[] {
    <span class="syntax-keyword">const</span> scoreMap = <span class="syntax-keyword">new</span> Map&lt;<span class="syntax-type">string</span>, { content: <span class="syntax-type">string</span>; score: <span class="syntax-type">number</span> }&gt;();

    <span class="syntax-keyword">const</span> applyRRF = (results: { docId: <span class="syntax-type">string</span>; content: <span class="syntax-type">string</span> }[]) =&gt; {
      results.forEach((item, index) =&gt; {
        <span class="syntax-keyword">const</span> rank = index + <span class="syntax-number">1</span>;
        <span class="syntax-keyword">const</span> rrfScore = <span class="syntax-number">1.0</span> / (<span class="syntax-keyword">this</span>.kDamp + rank);
        
        <span class="syntax-keyword">const</span> existing = scoreMap.get(item.docId);
        <span class="syntax-keyword">if</span> (existing) {
          existing.score += rrfScore;
        } <span class="syntax-keyword">else</span> {
          scoreMap.set(item.docId, { content: item.content, score: rrfScore });
        }
      });
    };

    applyRRF(vecResults);
    applyRRF(astResults);

    <span class="syntax-keyword">return</span> Array.from(scoreMap.entries())
      .map(([docId, val]) =&gt; ({ docId, content: val.content, score: parseFloat(val.score.toFixed(<span class="syntax-number">6</span>)) }))
      .sort((a, b) =&gt; b.score - a.score);
  }
}</pre>
                        </div>
                    </div>
                \`
            },
            sessions: {
                title: "PTY (伪终端) 流控制与原子提交事务圈",
                subtitle: "VT100 Decoder 状态机、Watchdog 阻塞监控与 Git 事务回滚",
                content: \`
                    <div class="drawer-section">
                        <p class="drawer-desc">
                            无状态的 <code>exec("cd /workspace && cmd")</code> 会抛弃当前环境变量与挂载会话。为了在有状态终端交互中实现完美控制，智能体底层需要接管常驻的 **PTY 伪终端双向流**。在此基础上，利用 **Git Transactional Ring** 确保代码变动具有原子性回滚的防崩护网。
                        </p>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">一、 伪终端 PTY 流处理与 VT100 控制序列规约</h4>
                        <div class="svg-container">
                            <svg class="svg-flow" width="600" height="200" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100%" height="100%" fill="rgba(255,255,255,0.01)" rx="8" />
                                <rect x="30" y="40" width="130" height="120" rx="10" fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" stroke-width="1.5"/>
                                <text x="95" y="105" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">node-pty Stream</text>

                                <path d="M 160 80 L 260 80" stroke="#06b6d4" stroke-width="1.5" />
                                <text x="210" y="70" fill="#06b6d4" font-size="9" text-anchor="middle">ANSI Byte Stream</text>

                                <rect x="260" y="40" width="130" height="120" rx="10" fill="rgba(6, 182, 212, 0.1)" stroke="#06b6d4" stroke-width="1.5"/>
                                <text x="325" y="90" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">VT100 Decoder</text>
                                <text x="325" y="110" fill="#cbd5e1" font-size="9" text-anchor="middle">(Strip-ANSI State)</text>

                                <path d="M 390 100 L 470 100" stroke="#10b981" stroke-width="1.5" />
                                <text x="430" y="90" fill="#10b981" font-size="9" text-anchor="middle">Clean Text</text>

                                <rect x="470" y="40" width="110" height="120" rx="10" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" stroke-width="1.5"/>
                                <text x="525" y="90" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">Watchdog</text>
                                <text x="525" y="110" fill="#a7f3d0" font-size="9" text-anchor="middle">(/\[y\/N\]/ Check)</text>
                            </svg>
                        </div>
                        <p>PTY 输出包含复杂的 VT100 终端控制代码（如 <code>\\u001b[2J</code> 清屏，<code>\\u001b[31m</code> 标红）。为了实现干净的上下文捕获：</p>
                        <ul>
                            <li><b>流式状态机去噪 (ANSI Decoder)</b>: 编写流式控制状态机解析器，识别 <code>\u001b[[()#;?]*[0-9A-ORZcf-nqry=&gt;&lt;]</code> 控制原语并执行底层过滤，保证大模型获得干净文本。</li>
                            <li><b>看门狗正则阻断监控 (Watchdog)</b>: 实时阻断扫描器。一旦匹配到阻塞型的会话指令（如 <code>/password/i</code>, <code>/\\[y\\/N\\]/i</code>），立即触发硬拦截，挂起 PTY 写入通道并自动推送 mock 回执，规避智能体因无限期假死导致的会话超时。</li>
                            <li><b>Git 事务环 (Git Transactional Ring)</b>: 每次修改文件前，Agent 后台通过分支快照建立原子隔离屏障。在验证失败时执行强行复位，实现无开销的文件系统秒级原子回退。</li>
                        </ul>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">二、 PTY 常驻流接管与分支回退模块实现</h4>
                        <p>以下为 TypeScript 下基于 PTY 伪终端接管、ANSI 剥离解码与 Git 事务回滚内核的底层模块还原：</p>
                        
                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">TypeScript</span>
                                <span>PTYTransactionRunner.ts</span>
                            </div>
                            <pre>
<span class="syntax-keyword">import</span> * <span class="syntax-keyword">as</span> pty <span class="syntax-keyword">from</span> <span class="syntax-string">"node-pty"</span>;
<span class="syntax-keyword">import</span> { execSync } <span class="syntax-keyword">from</span> <span class="syntax-string">"child_process"</span>;

<span class="syntax-keyword">export</span> <span class="syntax-keyword">class</span> <span class="syntax-type">PTYTransactionRunner</span> {
  <span class="syntax-keyword">private</span> ptyProcess: <span class="syntax-type">pty.IPty</span>;
  <span class="syntax-keyword">private</span> txBranchName: <span class="syntax-type">string</span> = <span class="syntax-string">""</span>;

  <span class="syntax-keyword">constructor</span>(cwd: <span class="syntax-type">string</span>) {
    <span class="syntax-keyword">this</span>.ptyProcess = pty.spawn(<span class="syntax-string">"bash"</span>, [], {
      name: <span class="syntax-string">"xterm-color"</span>, cols: <span class="syntax-number">80</span>, rows: <span class="syntax-number">30</span>, cwd, env: process.env
    });
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">beginTransaction</span>(): <span class="syntax-type">void</span> {
    <span class="syntax-keyword">this</span>.txBranchName = \`agent-tx-\${Date.now()}\`;
    execSync(\`git checkout -b \${<span class="syntax-keyword">this</span>.txBranchName}\`);
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">rollbackTransaction</span>(baseBranch: <span class="syntax-type">string</span> = <span class="syntax-string">"main"</span>): <span class="syntax-type">void</span> {
    execSync(\`git checkout \${baseBranch}\`);
    execSync(\`git branch -D \${<span class="syntax-keyword">this</span>.txBranchName}\`);
  }

  <span class="syntax-keyword">public</span> <span class="syntax-function">executeCommand</span>(cmd: <span class="syntax-type">string</span>, onData: (chunk: <span class="syntax-type">string</span>) =&gt; <span class="syntax-type">void</span>): <span class="syntax-type">Promise</span>&lt;<span class="syntax-type">void</span>&gt; {
    <span class="syntax-keyword">return</span> <span class="syntax-keyword">new</span> Promise((resolve) =&gt; {
      <span class="syntax-keyword">this</span>.ptyProcess.onData((rawChunk) =&gt; {
        <span class="syntax-keyword">const</span> clean = rawChunk.replace(/[\\u001b\\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=&gt;&lt;]/g, <span class="syntax-string">""</span>);
        onData(clean);
        
        <span class="syntax-keyword">if</span> (/\\\[y\\/N\\\]/i.test(clean)) {
          <span class="syntax-keyword">this</span>.ptyProcess.write(<span class="syntax-string">"y\\n"</span>);
        }
        <span class="syntax-keyword">if</span> (/command_completed_sentinel/.test(clean)) {
          resolve();
        }
      });
      <span class="syntax-keyword">this</span>.ptyProcess.write(\`\${cmd} && echo command_completed_sentinel\\n\`);
    });
  }
}</pre>
                        </div>
                    </div>
                \`
            },
            harness: {
                title: "VM 沙箱编译与自动化测试自愈反馈环",
                subtitle: "“Agent = Model + Harness” 核心物理定理深度架构设计",
                content: \`
                    <div class="drawer-section">
                        <p class="drawer-desc">
                            大模型仅提供静态推理，但只有借助 <b>Harness (测试与自愈运行容器)</b> 才能形成行级闭环。Harness Engineering (脚手架工程) 决定了智能体在遭遇真实物理编译/报错时的恢复与调试成功率。
                        </p>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">一、 反馈控制自愈回路原理 (Self-Healing Loop)</h4>
                        <p>当大模型生成的 Patch 在 PTY 执行测试并遭遇 TypeError/AssertionError 崩溃时，传统的暴力排错会将无关构建日志抛出，导致模型上下文严重崩坍。Harness 具备精密的日志裁剪与特征提取能力：</p>
                        <ul>
                            <li><b>日志提纯剪枝 (Log Pruning Mechanism)</b>: 剔除构建过程中的无关噪音。利用针对性的 StackTrace 正则匹配，抠取出报错行号、异常类名（如 TypeError, AssertionError）以及引发异常的前后各 5 行源码切片，对 context 进行极限提纯。</li>
                            <li><b>带有行号的局部滑窗视图投影 (File View Projection)</b>: 坚决避免将超长源码直接灌入 LLM。Harness 为模型提供带行号的滑动切片投影，并且只接收 <code>[StartLine, EndLine, ReplacementContent]</code> 级局部补丁合并命令，从而物理屏蔽生成随机断连导致的大段代码截断问题。</li>
                            <li><b>定制化安全 Shell 包装 (SWE-bash)</b>: 限制指令一次输出量最大不超过 100 行，以防爆量 token。定制挂载 scroll_down/scroll_up 分页读取命令，并在容器层对 <code>rm -rf /</code>、<code>mkfs</code> 等内核高危破坏命令执行硬中断。</li>
                        </ul>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">二、 工业级错误日志剪枝过滤器的底层实现</h4>
                        <p>以下为 Harness 内部专门用于捕获并极限裁切提纯 TypeScript Jest 单元测试失败堆栈的工具模块：</p>
                        
                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">TypeScript</span>
                                <span>HarnessLogPruner.ts</span>
                            </div>
                            <pre>
<span class="syntax-keyword">export</span> <span class="syntax-keyword">class</span> <span class="syntax-type">HarnessLogPruner</span> {
  <span class="syntax-keyword">public</span> <span class="syntax-function">pruneJestStackTrace</span>(rawOutput: <span class="syntax-type">string</span>): <span class="syntax-type">string</span> {
    <span class="syntax-keyword">const</span> lines = rawOutput.split(<span class="syntax-string">"\\n"</span>);
    <span class="syntax-keyword">const</span> prunedLines: <span class="syntax-type">string</span>[] = [];
    <span class="syntax-keyword">let</span> capturing = <span class="syntax-number">false</span>;

    <span class="syntax-keyword">for</span> (<span class="syntax-keyword">const</span> line <span class="syntax-keyword">of</span> lines) {
      <span class="syntax-keyword">if</span> (/FAIL|TypeError|AssertionError|Error:/i.test(line)) {
        capturing = <span class="syntax-number">true</span>;
      }
      <span class="syntax-keyword">if</span> (capturing) {
        prunedLines.push(line);
      }
      <span class="syntax-keyword">if</span> (prunedLines.length &gt;= <span class="syntax-number">15</span>) {
        <span class="syntax-keyword">break</span>;
      }
    }

    <span class="syntax-keyword">if</span> (prunedLines.length === <span class="syntax-number">0</span>) {
      <span class="syntax-keyword">return</span> rawOutput.substring(<span class="syntax-number">0</span>, <span class="syntax-number">300</span>) + <span class="syntax-string">"\\n... [Log Pruned for Context optimization] ..."</span>;
    }

    <span class="syntax-keyword">return</span> [
      <span class="syntax-string">"=== JEST TEST DIAGNOSTIC (HARNESS CROP) ==="</span>,
      ...prunedLines,
      <span class="syntax-string">"==========================================="</span>
    ].join(<span class="syntax-string">"\\n"</span>);
  }
}</pre>
                        </div>
                    </div>
                \`
            },
            v8ink: {
                title: "V8 引擎 JIT 优化管线与 React Ink 终端渲染层",
                subtitle: "去优化 Megamorphic Deopt 规避与 cell-diffing 终端差分渲染",
                content: \`
                    <div class="drawer-section">
                        <p class="drawer-desc">
                            作为在 Node.js 上构建的 Principal CLI 智能体（如 Claude Code, Antigravity），面对巨量依赖扫描与流式交互，如何确保极致性能？本章节深潜 <b>V8 引擎底层 Ignition-TurboFan 的单态 IC 优化规则</b>，以及基于 React Reconciler 的 <b>Ink 终端虚拟细胞帧 diffing 渲染管线</b>。
                        </p>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">一、 V8 引擎 JIT 优化与单态保障原则 (Monomorphic Consistency)</h4>
                        <p>大模型在调用编译比对和 Myers diff 合并时，算法属于高频热点。为了触发 V8 **TurboFan 编译器** 的机器码直接执行（Skip Bytecode Interpreter），开发者需要极力避免去优化（Deoptimization）：</p>
                        <ul>
                            <li><b>去优化避险 (Deopt Bailout)</b>: 在动态 JS 运行时，如果某方法被反复传入不同 Shapes 的对象（隐藏类数目超过 4 个时的超态 Megamorphic），V8 优化器会瞬间丢弃 TurboFan 机器码，强行回退字节码执行，引起数十倍卡顿。</li>
                            <li><b>单态化控制 (Monomorphic Preservation)</b>: 核心 Agent 代码在声明 AST 节点、Token 序列、RAG 向量时，强制使用具有严格 TypeScript 类型规约的单态函数，维持隐藏类的高度静态一致，锁死 TurboFan 本地优化通道。</li>
                        </ul>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">二、 React Ink 协调器与 Yoga Flexbox 终端 diffing 渲染</h4>
                        <p>Ink 渲染界面使用 React 声明式框架：它将 <code>&lt;Box&gt;</code>、<code>&lt;Text&gt;</code> 等组件在内存中映射为纯文本控制单元树。通过 Yoga 布局引擎，将 Flexbox 布局自动转换成字符矩阵下绝对的行、列网格物理坐标。</p>
                        <p>为了达到 60FPS 且绝不闪烁，渲染内核维护双帧矩阵，使用 <b>Virtual Cell Frame Diffing 算法</b> 对前后两帧字符坐标矩阵进行深度差分，拼装出最精简的光标 ANSI 移动补丁并写入 <code>stdout</code> 写入流。</p>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">三、 React Ink Virtual Grid Diffing 终端差分渲染引擎还原</h4>
                        <p>以下为 cell-diffing 二维终端缓冲区差分引擎的核心控制代码实现：</p>
                        
                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">TypeScript</span>
                                <span>VirtualTerminalDiffEngine.ts</span>
                            </div>
                            <pre>
<span class="syntax-keyword">export</span> <span class="syntax-keyword">class</span> <span class="syntax-type">VirtualTerminalDiffEngine</span> {
  <span class="syntax-keyword">public</span> <span class="syntax-function">diffAndRender</span>(oldFrame: <span class="syntax-type">string</span>[][], newFrame: <span class="syntax-type">string</span>[][]): <span class="syntax-type">string</span> {
    <span class="syntax-keyword">let</span> commands = <span class="syntax-string">""</span>;
    <span class="syntax-keyword">const</span> rows = newFrame.length;
    <span class="syntax-keyword">const</span> cols = rows &gt; <span class="syntax-number">0</span> ? newFrame[<span class="syntax-number">0</span>].length : <span class="syntax-number">0</span>;

    <span class="syntax-keyword">for</span> (<span class="syntax-keyword">let</span> r = <span class="syntax-number">0</span>; r &lt; rows; r++) {
      <span class="syntax-keyword">let</span> runStartCol = -<span class="syntax-number">1</span>;
      <span class="syntax-keyword">let</span> runText = <span class="syntax-string">""</span>;

      <span class="syntax-keyword">for</span> (<span class="syntax-keyword">let</span> c = <span class="syntax-number">0</span>; c &lt; cols; c++) {
        <span class="syntax-keyword">const</span> isDifferent = !oldFrame[r] || !oldFrame[r][c] || oldFrame[r][c] !== newFrame[r][c];

        <span class="syntax-keyword">if</span> (isDifferent) {
          <span class="syntax-keyword">if</span> (runStartCol === -<span class="syntax-number">1</span>) {
            runStartCol = c;
          }
          runText += newFrame[r][c];
        } <span class="syntax-keyword">else</span> {
          <span class="syntax-keyword">if</span> (runStartCol !== -<span class="syntax-number">1</span>) {
            commands += \`\\\\u001b[\${r + <span class="syntax-number">1</span>};\${runStartCol + <span class="syntax-number">1</span>}H\${runText}\`;
            runStartCol = -<span class="syntax-number">1</span>;
            runText = <span class="syntax-string">""</span>;
          }
        }
      }
      <span class="syntax-keyword">if</span> (runStartCol !== -<span class="syntax-number">1</span>) {
        commands += \`\\\\u001b[\${r + <span class="syntax-number">1</span>};\${runStartCol + <span class="syntax-number">1</span>}H\${runText}\`;
      }
    }
    <span class="syntax-keyword">return</span> commands;
  }
}</pre>
                        </div>
                    </div>
                \`
            },
            codexopencode: {
                title: "Codex 与 OpenCode 基底编程模型与 pass@k 科学对齐",
                subtitle: "对数空间无偏差 pass@k 估计求解与多轮反馈轨迹对齐 (RL/DPO)",
                content: \`
                    <div class="drawer-section">
                        <p class="drawer-desc">
                            大模型是智能体系统的核心“大脑”。本章节深潜从 OpenAI Codex 到开源 OpenCoder 的数据洗练对齐工程，推导 pass@k 的对数空间防止浮点下溢计算模型，剖析 OpenCodeInterpreter 的执行多轮反馈强化对齐（RLHF/Trajectories）。
                        </p>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">一、 pass@k 无偏差概率估计公式对数空间求解推导</h4>
                        <p>传统统计学在测试大模型代码生成成功概率时，若采用简单的 $pass@k = \\frac{\\text{Successes}}{k}$ 包含剧烈偏差。Codex 提出了 unbiased pass@k Hypergeometric 概率分布估计公式：</p>
                        <div style="text-align: center; margin: 0.5rem 0;">
                            $$pass@k = 1 - \\frac{\\binom{n - c}{k}}{\\binom{n}{k}} = 1 - \\frac{(n-c)! \\cdot (n-k)!}{(n-c-k)! \\cdot n!}$$
                        </div>
                        <p>在实际评测中（采样总数 $n$ 与成功数 $c$ 极大），阶乘计算会直接引发内存溢出或浮点下溢。工业级评测计算框架全部采用<b>对数空间（Log-space）结合 Gamma 函数</b>进行重构：</p>
                        <div style="text-align: center; margin: 0.5rem 0;">
                            $$\\ln \\binom{N}{K} = \\ln \\Gamma(N + 1) - \\ln \\Gamma(K + 1) - \\ln \\Gamma(N - K + 1)$$
                            $$pass@k = 1 - \\exp\\left( \\ln\\binom{n-c}{k} - \\ln\\binom{n}{k} \\right)$$
                        </div>
                        [注：其中 $\\Gamma(x)$ 为经典的伽马函数，在 JS/Python 中通过专用 log-gamma 算法秒级输出，确保了大样本评测无任何溢出崩溃]
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">二、 OpenCoder 预训练与 OpenCodeInterpreter 执行多轮对齐机制</h4>
                        <ul>
                            <li><b>开源混料配比 (Data Curation Recipe)</b>: OpenCoder 科学配比去重体系：<b>50% 清洗去重源代码 + 35% 编程 QA 问答合成集 + 15% 精选自然语言语料</b>，防止丧失常识理解能力。</li>
                            <li><b>与编译器对齐 (Execution Feedback Trajectories)</b>: OpenCodeInterpreter 首次将真实的 Linux 沙箱解释器报错作为强监督微调（SFT）信号。通过喂给模型“生成报错-阅读 TypeError-修改-通过”的完整**轨迹（Trajectories）**，让大模型在参数层面建立对 PTY 物理返回自愈的逻辑能力。</li>
                        </ul>
                    </div>

                    <div class="drawer-section">
                        <h4 class="drawer-section-title">三、 pass@k 对数空间计算引擎 Python 工业实现</h4>
                        <p>以下为无偏差 pass@k 对数空间 Gamma 计算模型的完整实现代码：</p>
                        
                        <div class="code-container">
                            <div class="code-header">
                                <span class="code-lang">Python</span>
                                <span>pass_at_k_logspace.py</span>
                            </div>
                            <pre>
<span class="syntax-keyword">import</span> math

<span class="syntax-keyword">def</span> <span class="syntax-function">log_gamma</span>(x: <span class="syntax-type">float</span>) -&gt; <span class="syntax-type">float</span>:
    <span class="syntax-keyword">return</span> math.lgamma(x)

<span class="syntax-keyword">def</span> <span class="syntax-function">ln_combination</span>(n: <span class="syntax-type">int</span>, k: <span class="syntax-type">int</span>) -&gt; <span class="syntax-type">float</span>:
    <span class="syntax-keyword">if</span> k &lt; <span class="syntax-number">0</span> <span class="syntax-keyword">or</span> k &gt; n:
        <span class="syntax-keyword">return</span> -float(<span class="syntax-string">'inf'</span>)
    <span class="syntax-keyword">return</span> log_gamma(n + <span class="syntax-number">1</span>) - log_gamma(k + <span class="syntax-number">1</span>) - log_gamma(n - k + <span class="syntax-number">1</span>)

<span class="syntax-keyword">def</span> <span class="syntax-function">calculate_unbiased_pass_at_k</span>(n: <span class="syntax-type">int</span>, c: <span class="syntax-type">int</span>, k: <span class="syntax-type">int</span>) -&gt; <span class="syntax-type">float</span>:
    <span class="syntax-keyword">if</span> n - c &lt; k:
        <span class="syntax-keyword">return</span> <span class="syntax-number">1.0</span>
        
    ln_numerator = ln_combination(n - c, k)
    ln_denominator = ln_combination(n, k)
    
    prob_fail = math.exp(ln_numerator - ln_denominator)
    <span class="syntax-keyword">return</span> round(<span class="syntax-number">1.0</span> - prob_fail, <span class="syntax-number">5</span>)

print(<span class="syntax-string">"Unbiased pass@5: "</span>, calculate_unbiased_pass_at_k(<span class="syntax-number">200</span>, <span class="syntax-number">45</span>, <span class="syntax-number">5</span>))</pre>
                        </div>
                    </div>
                \`
            }
        };`;

    const targetPart = html.substring(startTechDetailsIdx, endTechDetailsIdx);
    const escapedTechDetails = systemsTechDetails
        .replace(/`/g, '\\`')
        .replace(/\${/g, '\\${')
        .replace(/content:\s*\\`/g, 'content: `')
        .replace(/\\`(\s*})/g, '`$1');
    html = html.replace(targetPart, escapedTechDetails + '\n\n        ');
    console.log('✓ Replaced techDetails data object successfully.');
} else {
    console.error('✗ Could not locate techDetails boundary in HTML!');
}

// 4. Upgrading prose, headers, and descriptions for absolute systems engineering rigour
console.log('Upgrading headers and terminology in HTML body...');
html = html.replace('<h2 class="section-title">工具演进里程碑与数学范式退化分析</h2>', '<h2 class="section-title">1.0 Architectural Evolution & POMDP State Formulations</h2>');
html = html.replace('<h2 class="section-title">核心技术深潜规格</h2>', '<h2 class="section-title">2.0 Core Subsystem Technical Specifications (RFC-409 Deep Dive)</h2>');
html = html.replace('<h2 class="section-title">Agent 物理自愈闭环调试模拟器</h2>', '<h2 class="section-title">3.0 Self-Healing Operations & Execution Trace Verification</h2>');
html = html.replace('<h2 class="section-title">顶级 Code Agent 的工业工程落地实践</h2>', '<h2 class="section-title">4.0 Industrial Deployments & Systems Engineering Deep Dive</h2>');
html = html.replace('<h2 class="section-title">核心设计模式与底层系统工程还原</h2>', '<h2 class="section-title">5.0 Reference Implementations & Mathematical Models</h2>');
html = html.replace('<h2 class="section-title">Code Agent 核心引擎技术参数横向对比矩阵</h2>', '<h2 class="section-title">6.0 System Design Parameters & Architectural Matrix</h2>');

// Navigation titles
html = html.replace('💡 背景与范式变革', '💡 Background Context & Paradigm shift');
html = html.replace('⏳ 演进史里程碑', '⏳ 1.0 Evolutionary Trajectory');
html = html.replace('🧠 核心技术深潜', '🧠 2.0 Subsystem Specifications');
html = html.replace('🔄 执行流自愈模拟', '🔄 3.0 Operations Simulator');
html = html.replace('🏢 头部厂商实践', '🏢 4.0 Industrial Deployments');
html = html.replace('⚙️ 核心模式工程还原', '⚙️ 5.0 Reference Algorithms');
html = html.replace('📊 终极对比矩阵', '📊 6.0 Architectural Benchmarks');

// Save the upgraded HTML file
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('\n★ All upgrades written successfully to code_agent_evolution.html! ★');
