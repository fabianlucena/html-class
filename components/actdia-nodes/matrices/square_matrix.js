export default async function create({ actdia, _f }) {
  const { Matrix } = await actdia.importElementClass(import.meta.url.replace('square_matrix.js', 'matrix.js'));
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
      this.dimension = [value, value];
    }
  };
}