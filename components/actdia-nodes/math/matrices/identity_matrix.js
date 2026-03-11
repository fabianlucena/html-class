export default async function create({ actdia, _f }) {
  const { SquareMatrix } = await actdia.importElementClassForMeta('square_matrix.js', import.meta);
  
  return class IdentityMatrix extends SquareMatrix {
    static _label = _f('Identity matrix');

    saveStatus = false;
    editable = false;

    update() {
      super.update();
      this.setStatus([...Array(this.size)]
        .map((_, i) => [...Array(this.size)]
          .map((_, j) => +(i === j))
        )
      );
      if (!this.isInitializing)
        this.updateStatus();
    }
  };
}