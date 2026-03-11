export default async function create({ actdia, _f }) {
  const { Matrix } = await actdia.importElementClassForMeta('matrix.js', import.meta);

  return class SquareMatrix extends Matrix {
    static _label = _f('Square matrix');

    fields = [
      {
        name: 'size',
        type: 'number',
        min: 1,
        step: 1,
        _label: _f('Size'),
        isTool: true,
      },
    ];

    get size() {
      return this.dimension[0];
    }

    set size(value) {
      if (value !== this.size) {
        this.dimension = [value, value];
      }
    }
  };
}