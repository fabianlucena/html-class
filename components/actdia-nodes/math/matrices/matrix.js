export default async function create({ actdia, _f }) {
  const { MatrixBase } = await actdia.importElementClass(import.meta.url.replace('matrix.js', 'matrix_base.js'));
  
  return class Matrix extends MatrixBase {
    static _label = _f('Matrix');

    connectors = [
      { name: 'output', type: 'out', x: 2, y: 1, direction: 'right', extends: 'tiny' },
    ];

    editable = true;
    #output = null;
    
    init() {
      super.init(...arguments);
      this.#output = this.getConnector('output');
    }

    update() {
      if (this.isInitializing)
        return;
      
      super.update();
      this.#output.x = this.box.width - this.box.x;
      this.#output.y = this.box.height / 2 - this.box.y;
      this.tryUpdateConnector(this.#output);
    }
  };
}