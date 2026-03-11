export default async function create({ actdia, _ }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { Screen } = await actdia.importElementClassForMeta('screen.js', import.meta);

  return class CartesianPlane extends Screen {
    static label = _('Cartesian plane');

    #shapeOrigin;

    init() {
      this.setDrawScale([1, -1], false);
      this.setAutoOffset(true, false);
      this.setClosePath(false, false);
      this.setAxis({ x: true, y: true }, false);
      this.setGrid({ x: true, y: true }, false);
      this.setClosePath(false, false);
      super.init(...arguments);
      if (this.shape) {
        if (!this.#shapeOrigin) {
          this.#shapeOrigin = this.getShape('origin');
          if (!this.shapeOrigin) {
            this.shape.children.push({
              shape: 'text',
              name: 'origin',
              text: '0',
              fontSize: .8,
              fill: '#A0A0A080',
            });
            this.#shapeOrigin = this.getShape('origin');
          }
        }
      }
    }

    setWidth(value) {
      if (this.autoOffset) {
        this.setDrawOffset({ x: value / 2, y: this.drawOffset.y }, false);
      }
      super.setWidth(...arguments);
    }

    setHeight(value) {
      if (this.autoOffset) {
        this.setDrawOffset({ x: this.drawOffset.x, y: value / 2 }, false);
      }
      super.setHeight(...arguments);
    }

    autoOffsetUpdate() {
      if (this.autoOffset) {
        this.setDrawOffset({ x: this.width / 2, y: this.height / 2 }, false);
      }
    }

    updateStatus() {
      this.#shapeOrigin.x = this.drawOffset.x;
      this.#shapeOrigin.y = this.drawOffset.y + 1;
      this.updateShape(this.#shapeOrigin);
      super.updateStatus(...arguments);
    }
  };
}