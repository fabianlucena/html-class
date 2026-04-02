let initialized = false;

export default async function create({ actdia, Node }) {
  await actdia.loadLocaleForMeta(import.meta);
  const { LabelIO } = await actdia.getElementsClassOrImportForMeta('label_io.js', import.meta);

  if (!initialized) {
    initialized = true;
    actdia.addLabeledStatusListener((label, status, item) => {
      const items = actdia.items
        .filter(i => i.elementClass === 'LabelIOSelector' && i.label === label && i !== item);

      items.forEach(item => item.setStatus(status, { force: true }));
    });
  }

  return class LabelIOSelector extends LabelIO {
    static label = 'Label IO selector';

    shape = {
      children: [
        {
          name: 'base',
          shape: 'path',
          d: 'M .5 0 h 5 l .5 .5 l -.5 .5 v 1 h -5 v -1 l -.5 -.5 l .5 -.5 z',
        },
        {
          name: 'labels',
          shape: 'text',
          x: 2,
          y: .25,
          width: 5,
          height: 3,
          fontSize: 1,
          lineSpacing: 1.0,
          text: 'Label 1\nLabel 2\nLabel 3',
          textAnchor: 'start',
          dominantBaseline: 'top',
          editable: true,
          onInput: evt => {
            this.isEditing = true;
            this.labels = evt.data;

          },
          onBlur: () => this.isEditing = false,
        },
        {
          name: 'buttons',
          x: .25,
          y: .25,
          children: [],
        },
      ],
    };

    box = {
      width: 7,
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

    #labels = [ 'Label 1', 'Label 2', 'Label 3' ];
    #baseShape = null;
    #labelsShape = null;
    #buttonsShape = null;

    get labels() {
      return this.#labels;
    }
    
    set labels(value) {
      if (typeof value === 'string') {
        value = value.split('\n');
      } else if (!Array.isArray(value)) {
        value = [ String(value) ];
      }

      const selectedIndex = this.selectedIndex;
      this.#labels = value;
      this.selectLabelIndex(selectedIndex);

      if (this.#labelsShape?.svgElement)
          this.update();
    }

    get labelsCount() {
      return this.#labels.length;
    }

    get selectedIndex() {
      return this.labels.findIndex(label => label === this.label);
    }

    init() {
      super.init(...arguments);
      this.#baseShape = this.getShape('base');
      this.#labelsShape = this.getShape('labels');
      this.#buttonsShape = this.getShape('buttons');
    }

    getData() {
      const data = super.getData();
      data.labels = this.labels;
      return data;
    }
    
    update() {
      if (!this.#baseShape) {
        return;
      }

      const width = this.box.width;
      const lines = Math.max(2, this.labelsCount);
      this.#baseShape.d = `M .5 0 h ${width - 1} l .5 .5 l -.5 .5 v ${lines} h -${width - 1} v -${lines} l -.5 -.5 l .5 -.5 z`;
      this.#labelsShape.text = this.labels.join('\n');
      this.#labelsShape.width = width - 2.75;
      this.#labelsShape.height = lines;
      this.box.height = lines + 1;
      this.io1.x = 0;
      this.io1.y = .5;
      this.io2.x = width;
      this.io2.y = .5;

      this.#buttonsShape.children = Array.from({ length: this.labelsCount }, (_, i) => ({
        shape: 'circle',
        name: `label-${i}`,
        x: 1,
        y: .5 + i,
        r: .4,
      }));

      let selectedIndex = this.selectedIndex;
      this.selectLabelIndex(selectedIndex);
      selectedIndex = this.selectedIndex;
      
      if (selectedIndex !== -1) {
        this.#buttonsShape.children.push({
          shape: 'circle',
          name: `thumb`,
          x: 1,
          y: .5 + selectedIndex,
          r: .28,
          fill: 'lightblue',
        });
      }

      this.nodeUpdate();
    }

    onClick({ shape }) {
      const newIndexText = shape?.name?.match(/^label-(\d+)$/)?.[1];
      if (typeof newIndexText !== 'string') {
        return;
      }

      const newIndex = parseInt(newIndexText);
      if (isNaN(newIndex)) {
        return;
      }

      this.selectLabelIndex(newIndex);
    }

    selectLabelIndex(newIndex) {
      if (newIndex < 0) {
        newIndex = 0;
      } else {
        const labelsCount = this.labelsCount;
        if (newIndex >= labelsCount) {
          newIndex = labelsCount - 1;
        }
      }

      const newLabel = this.labels[newIndex];
      if (this.label !== newLabel) {
        this.label = newLabel;
        this.update();
      }
    }
 };
}