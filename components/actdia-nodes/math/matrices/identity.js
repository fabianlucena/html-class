export default async function create({ actdia, _f }) {
  const { SquareMatrix } = await actdia.importElementClass(import.meta.url.replace('identity.js', 'square_matrix.js'));
  return class Identity extends SquareMatrix {
    static _label = _f('Identity matrix');

    update() {
      this.setStatus([...Array(this.size)]
        .map((_, i) => [...Array(this.size)]
          .map((_, j) => +(i === j))
        )
      );
      super.update();
      this.propagate();
    }
  };
}