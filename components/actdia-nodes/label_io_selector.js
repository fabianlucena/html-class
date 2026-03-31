export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { LabelIO } = await actdia.getElementsClassOrImportForMeta('label_io.js', import.meta);

  actdia.addLabeledStatusListener((label, status, item) => {
    const items = actdia.items
      .filter(i => i.elementClass === 'LabelIOSelector' && i.label === label && i !== item);

    items.forEach(item => item.setStatus(status, { force: true }));
  });

  return class LabelIOSelector extends LabelIO {
    static label = 'Label IO selector';

    shape = {
      children: [
        {
          name: 'base',
          x: -3,
          y: -.5,
          shape: 'path',
          d: 'M .5 0 h 5 l .5 .5 l -.5 .5 v 1 h -5 v -1 l -.5 -.5 l .5 -.5 z',
        },
        {
          name: 'labels',
          shape: 'text',
          x: -1.5,
          y: -.5,
          width: 5,
          height: 3,
          fontSize: .8,
          lineSpacing: 1.0,
          text: 'Label 11111111111111111\nLabel 2\nLabel 3',
          textAnchor: 'start',
          dominantBaseline: 'top',
          editable: true,
          onInput: evt => {
            this.isEditing = true;
            this.labels = evt.data;
          },
          onBlur: () => this.isEditing = false,
        },
      ],
    };

    box = {
      x: -3,
      y: -.5,
      width: 6,
      height: 2,
    };

    canChangeWidth = true;

    fields = [
      {
        name: 'label',
        type: 'text',
        _label: 'Label',
        isTool: true,
      },
    ];

    #baseShape = null;
    #labelsShape = null;

    get labels() {
      return this.#labelsShape.text;
    }
    
    set labels(value) {
      if (this.#labelsShape.text !== value) {
        this.#labelsShape.text = value;
        if (this.#labelsShape.svgElement)
          this.update();
      }
    }

    init() {
      super.init(...arguments);
      this.#baseShape = this.getShape('base');
      this.#labelsShape = this.getShape('labels');
    }
    
    update() {
      const width = this.box.width;
      const lines = Math.max(2, this.labels.split('\n').length);
      this.#baseShape.d = `M .5 0 h ${width - 1} l .5 .5 l -.5 .5 v ${lines} h -${width - 1} v -${lines} l -.5 -.5 l .5 -.5 z`;
      this.#labelsShape.width = width - 2;
      this.#labelsShape.height = lines;
      this.box.height = lines;
      this.nodeUpdate?.();
    }
 };
}