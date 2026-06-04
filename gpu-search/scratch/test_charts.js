// Mock browser global environment
const fs = require('fs');

global.window = {
  devicePixelRatio: 1,
  addEventListener: () => {}
};
global.document = {
  documentElement: {
    classList: {
      contains: () => false
    }
  },
  getElementById: (id) => {
    return {
      parentElement: {
        clientWidth: 800
      },
      getContext: () => {
        return {
          scale: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          quadraticCurveTo: () => {},
          closePath: () => {},
          save: () => {},
          restore: () => {},
          stroke: () => {},
          fill: () => {},
          fillText: () => {},
          setLineDash: () => {},
          arc: () => {},
          createLinearGradient: () => {
            return {
              addColorStop: () => {}
            };
          }
        };
      },
      style: {}
    };
  }
};

const code = fs.readFileSync('./report/charts.js', 'utf8');

try {
  // eval in global context
  eval(code);
  console.log("SUCCESS: charts.js parsed and loaded in global context with no errors!");
  
  if (typeof drawAllReduce === 'function') {
    drawAllReduce('allreduceChart');
    console.log("SUCCESS: drawAllReduce executed with no errors!");
  } else {
    console.error("FAILURE: drawAllReduce is not a function!");
  }
} catch (e) {
  console.error("FAILURE:", e);
}
