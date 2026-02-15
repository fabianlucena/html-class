function formatNumber(number) {
  if (number === null || number === undefined)
    return 'und';

  if (typeof number !== 'number')
    return String(number);

  if (number === 0)
    return '0';
  
  if (isNaN(number) || !isFinite(number))
    return 'NaN';

  let result = number.toFixed(4);
  if (number >= 0)
    result = '  ' + result;

  return result;
}
  
export default function create({ Node }) {
  return class PerceptronViewer extends Node {
    static label = 'Perceptron Viewer';
    
    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 5,
          height: 4,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 0,
          width: 5,
          height: 4,
          text: '',
          fontSize: .8,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 5,
      height: 4,
    };

    connectors = [
      { name: 'i0', type: 'in', x: 0, y: 2, direction: 'left' },
    ];

    updateStatus() {
      let perceptron = this.connectors[0].connections?.[0]?.from?.item;
      if (!perceptron || perceptron.elementClass !== 'Perceptron')
        return;
      
      let data = [
        ' b: ' + formatNumber(perceptron.bias),
        ...perceptron.weights.map((v, i) => `w${i}: ${formatNumber(v)}`),
        ' o: ' + formatNumber(perceptron.status),
      ];
      
      this.shape.shapes[1].text = data.join('\n');
      this.actdia.tryUpdateShape(this, this.svgShape?.children?.[1], this.shape.shapes[1]);
    }
  };
}