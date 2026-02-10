function formatNumber(number) {
  if (number === null || number === undefined)
    return 'und';

  if (typeof number !== 'number')
    return String(number);

  if (number === 0)
    return '0';
  
  if (isNaN(number) || !isFinite(number))
    return 'NaN';

  return number.toFixed(2);
}
  
export default function create({ Node }) {
  return class NNViewer extends Node {
    static label = 'Neural Network Viewer';
    
    shape = {
      shapes: [
        {
          shape: 'rect',
          x: 0,
          y: 0,
          width: 15,
          height: 4,
          rx: .2,
          ry: .2,
        },
        {
          shape: 'text',
          x: 0,
          width: 15,
          height: 4,
          text: '',
          fontSize: .8,
        },
      ],
    };

    box = {
      x: 0,
      y: 0,
      width: 12,
      height: 4,
    };

    connectors = [
      { name: 'i0', type: 'in', x: 0, y: 2, direction: 'left' },
    ];

    updateStatus() {
      let includedIds = [];
      let layer = this.connectors[0].connections
        .map(c => c?.from?.item)
        .filter(n => n.elementClass === 'Perceptron');
      let data = [];

      includedIds.push(...layer.map(n => n.id));

      while (layer.length) {
        data.push(layer.map(n => [n.bias, ...n.weights]).flat());
        const newlayer = layer.map(n => n.connectors
            .filter(c => c.type === 'in')
            .map(c => c.connections.map(c => c?.from?.item).flat())
            .flat()
          )
          .flat()
          .filter(n => n.elementClass === 'Perceptron' && !includedIds.includes(n.id));

        layer = [];
        for (const n of newlayer) {
          if (includedIds.includes(n.id))
            continue;
          
          layer.push(n);
          includedIds.push(n.id);
        }
      }
      
      this.shape.shapes[1].text = data.map(l => l.map(x => formatNumber(x)).join(' • ')).join('\n');
      this.actdia.tryUpdateShape(this, this.svgShape?.children?.[1], this.shape.shapes[1]);
    }
  };
}