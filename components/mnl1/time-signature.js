import StaffItem from './staff-item.js';

const symbols = [
  {
    id: 'time-signature-1',
    viewBox: '0.06 -.98 1.28 1.96',
    path: 'M 1.3 0.7881 L 0.9963 0.7881 L 0.9963 -0.9319 C 0.9963 -0.96 0.9763 -0.98 0.9481 -0.98 L 0.5519 -0.98 C 0.5438 -0.98 0.5363 -0.9763 0.5281 -0.9719 L 0.5119 -0.9563 L 0.0638 -0.18 C 0.06 -0.1719 0.06 -0.1638 0.06 -0.1563 C 0.06 -0.14 0.0719 -0.1237 0.0838 -0.1163 L 0.16 -0.0719 C 0.1681 -0.0681 0.1762 -0.0638 0.1837 -0.0638 C 0.2 -0.0638 0.2162 -0.0762 0.2238 -0.0881 L 0.5081 -0.5763 L 0.5081 0.7881 L 0.2038 0.7881 C 0.1762 0.7881 0.1563 0.8081 0.1563 0.8363 L 0.1563 0.9238 C 0.1563 0.9519 0.1762 0.9719 0.2038 0.9719 L 1.3 0.9719 C 1.3281 0.9719 1.3444 0.9519 1.3444 0.9238 L 1.3444 0.8363 C 1.3444 0.8081 1.3281 0.7881 1.3 0.7881',
    offset: { x: 0, y: -.98 },
    width: 1.22,
    height: 1.96,
  },
  {
    id: 'time-signature-2',
    viewBox: '0.06 -.98 1.45 1.96',
    path: 'M 1.3681 0.1563 C 1.3363 0.2437 1.2563 0.5319 1.06 0.5319 C 0.8 0.5319 0.7438 0.3719 0.5281 0.3719 C 0.4963 0.3719 0.4638 0.3763 0.4238 0.3838 C 0.4238 0.3838 0.5238 0.2319 0.9481 0.1 C 1.3719 -0.0319 1.48 -0.24 1.48 -0.48 C 1.48 -0.6481 1.4044 -0.98 0.8 -0.98 C 0.1963 -0.98 0.0838 -0.6163 0.0838 -0.4319 C 0.0838 -0.2681 0.22 -0.1363 0.3838 -0.1363 C 0.5481 -0.1363 0.68 -0.2681 0.68 -0.4319 C 0.68 -0.5438 0.6 -0.6681 0.4963 -0.7081 C 0.4838 -0.7119 0.4681 -0.7319 0.4681 -0.7519 C 0.4681 -0.7763 0.4881 -0.8038 0.56 -0.8238 C 0.58 -0.8319 0.6363 -0.8438 0.6963 -0.8438 C 0.7519 -0.8438 0.8163 -0.8319 0.8638 -0.8 C 0.94 -0.7519 0.9681 -0.68 0.9681 -0.5 C 0.9681 -0.0319 0.4119 0.0681 0.18 0.4163 C 0.18 0.4163 0.06 0.5838 0.06 0.7719 C 0.06 0.96 0.1563 0.9719 0.2038 0.9719 C 0.2681 0.9719 0.3362 0.92 0.3362 0.8481 C 0.3362 0.8319 0.3319 0.8163 0.3237 0.7963 C 0.3 0.74 0.2919 0.6963 0.2919 0.6638 C 0.2919 0.6519 0.2919 0.64 0.2963 0.6281 C 0.3 0.6038 0.3319 0.5638 0.4281 0.5638 C 0.5438 0.5638 0.5881 0.7 0.66 0.8038 C 0.7319 0.9081 0.8438 0.9719 0.9719 0.9719 C 1.1 0.9719 1.2719 0.88 1.3444 0.7319 C 1.4163 0.5838 1.5081 0.2838 1.5081 0.1762 C 1.5081 0.1237 1.4763 0.1 1.44 0.1 C 1.4119 0.1 1.3844 0.1163 1.3681 0.1563',
    offset: { x: 0, y: -.98 },
    width: 1.39,
    height: 1.96,
  },
  {
    id: 'time-signature-3',
    viewBox: '0.04 -.98 1.42 1.96',
    path: 'M 1.0806 -0.0638 L 1.0888 -0.0638 C 1.4088 -0.1881 1.4288 -0.3962 1.4288 -0.4681 L 1.4288 -0.4881 C 1.4288 -0.5238 1.4169 -0.9763 0.7288 -0.9763 C 0.0406 -0.9763 0.0606 -0.4881 0.0606 -0.4881 L 0.065 -0.4881 L 0.0606 -0.48 C 0.0606 -0.3362 0.1769 -0.2238 0.3206 -0.2238 C 0.465 -0.2238 0.5769 -0.3362 0.5769 -0.48 C 0.5769 -0.5963 0.4888 -0.7081 0.3769 -0.7319 L 0.3887 -0.7438 C 0.445 -0.7838 0.5206 -0.8038 0.5969 -0.8038 C 0.765 -0.8038 0.945 -0.7038 0.945 -0.4881 C 0.945 -0.2363 0.7569 -0.2 0.7088 -0.1919 C 0.6606 -0.1837 0.4369 -0.1681 0.3887 -0.1681 C 0.3406 -0.1681 0.3369 -0.1119 0.3369 -0.1119 L 0.3369 -0.0319 C 0.3369 -0.0319 0.345 0.0119 0.3887 0.0163 C 0.4569 0.02 0.5488 0.02 0.6769 0.04 C 0.8525 0.0638 0.945 0.1837 0.945 0.4638 C 0.945 0.7319 0.765 0.8038 0.5969 0.8038 C 0.485 0.8038 0.3806 0.7719 0.3369 0.74 C 0.4688 0.7319 0.5769 0.6163 0.5769 0.4838 C 0.5769 0.34 0.465 0.2238 0.3206 0.2238 C 0.1769 0.2238 0.0606 0.34 0.0606 0.4838 C 0.0606 0.4838 0.0406 0.6638 0.2169 0.8281 C 0.3725 0.9719 0.5688 0.9763 0.6569 0.9763 C 1.0406 0.9763 1.4569 0.8438 1.4569 0.4081 C 1.4569 0.1163 1.2569 -0.0081 1.0806 -0.0638',
    offset: { x: 0, y: -.98 },
    width: 1.39,
    height: 1.96,
  },
  {
    id: 'time-signature-4',
    viewBox: '0.04 -1 1.45 2',
    path: 'M 0.1438 0.505 L 0.8306 0.505 L 0.8306 0.8031 L 0.5019 0.8031 C 0.4706 0.8031 0.445 0.8281 0.445 0.8594 L 0.445 0.9356 C 0.445 0.9669 0.4706 0.9919 0.5019 0.9919 L 1.7119 0.9919 C 1.7431 0.9919 1.7681 0.9669 1.7681 0.9356 L 1.7681 0.8594 C 1.7681 0.8281 1.7431 0.8031 1.7119 0.8031 L 1.3544 0.8031 L 1.3544 0.505 L 1.7119 0.505 C 1.7431 0.505 1.7681 0.48 1.7681 0.4488 L 1.7681 0.3725 C 1.7681 0.3412 1.7431 0.3163 1.7119 0.3163 L 1.3544 0.3163 L 1.3544 -0.3225 C 1.3544 -0.3438 1.3419 -0.3631 1.3231 -0.3725 L 1.2744 -0.3969 C 1.2531 -0.4069 1.2281 -0.4031 1.2106 -0.3875 L 0.8488 -0.055 C 0.8375 -0.0438 0.8306 -0.0294 0.8306 -0.0131 L 0.8306 0.3163 L 0.37 0.3163 C 0.37 0.3163 0.815 -0.165 1.2888 -0.7956 C 1.3231 -0.8419 1.3031 -0.8838 1.2956 -0.8913 L 1.2088 -0.9794 C 1.1981 -0.99 1.1838 -0.9963 1.1688 -0.9963 C 1.145 -0.9963 0.6025 -0.995 0.5738 -0.9963 C 0.545 -0.9969 0.5238 -0.9719 0.5206 -0.9475 C 0.5206 -0.9475 0.4994 -0.6531 0.395 -0.3275 C 0.2913 -0.0031 0.1738 0.1963 0.0675 0.3412 C 0.0675 0.3412 0.0456 0.3806 0.06 0.4106 C 0.0737 0.4406 0.0994 0.4838 0.0994 0.4838 C 0.0994 0.4838 0.1094 0.505 0.1438 0.505',
    offset: { x: 0, y: -.98 },
    width: 1.45,
    height: 2,
  },
  {
    id: 'time-signature-5',
    viewBox: '0.06 -.99 1.39 1.97',
    path: 'M 0.1081 -0.8719 C 0.1081 -0.8719 0.1281 -0.68 0.1281 -0.4719 L 0.1281 -0.42 C 0.1237 -0.1963 0.1081 0.0681 0.1081 0.0681 C 0.1081 0.0681 0.1 0.1237 0.1363 0.1319 C 0.1719 0.14 0.2562 0.16 0.2762 0.1638 C 0.3 0.1681 0.3237 0.1681 0.3362 0.1363 C 0.3563 0.0838 0.4 -0.1237 0.6519 -0.1237 C 0.9363 -0.1237 0.9881 0.12 0.9881 0.3119 C 0.9881 0.5119 0.9238 0.8 0.66 0.8119 L 0.6281 0.8119 C 0.5363 0.8119 0.4838 0.8 0.46 0.7838 C 0.4363 0.7763 0.4319 0.7481 0.4563 0.7319 C 0.4919 0.7081 0.6163 0.6638 0.6163 0.4681 C 0.6163 0.2719 0.48 0.1963 0.3237 0.1963 C 0.1681 0.1963 0.06 0.34 0.06 0.4763 C 0.06 0.6119 0.1 0.7638 0.3081 0.8838 C 0.4081 0.94 0.5519 0.9763 0.7 0.9763 C 0.9038 0.9763 1.1244 0.9119 1.2681 0.7638 C 1.3963 0.6319 1.4481 0.4638 1.4481 0.3038 C 1.4481 0.0881 1.3519 -0.12 1.2044 -0.22 C 1.1044 -0.2881 0.9319 -0.3438 0.7519 -0.3438 C 0.62 -0.3438 0.48 -0.3119 0.3638 -0.2319 C 0.36 -0.2281 0.3519 -0.2281 0.3481 -0.2281 C 0.3319 -0.2281 0.32 -0.24 0.32 -0.2562 L 0.32 -0.5081 C 0.32 -0.5319 0.34 -0.5519 0.3638 -0.5519 L 0.3681 -0.5519 C 0.4281 -0.5481 0.56 -0.5319 0.7 -0.5319 C 0.82 -0.5319 0.9438 -0.5438 1.0319 -0.58 C 1.22 -0.6563 1.2844 -0.8038 1.3163 -0.8881 C 1.32 -0.9 1.3244 -0.9163 1.3244 -0.9281 C 1.3244 -0.96 1.3044 -0.9838 1.2519 -0.9838 C 1.2363 -0.9838 1.22 -0.98 1.1963 -0.9763 C 1 -0.9281 0.8481 -0.9119 0.7 -0.9119 C 0.5563 -0.9119 0.4163 -0.9281 0.2437 -0.9519 C 0.2437 -0.9519 0.2238 -0.9563 0.1963 -0.9563 C 0.1519 -0.9563 0.1 -0.9438 0.1081 -0.8719',
    offset: { x: 0, y: -.95 },
    width: 1.39,
    height: 1.97,
  },
  {
    id: 'time-signature-6',
    viewBox: '0.06 -.98 1.49 1.96',
    path: 'M 0.9881 -0.1919 C 0.7438 -0.1919 0.6563 -0.12 0.6 -0.06 C 0.5881 -0.1438 0.58 -0.2081 0.58 -0.2719 C 0.58 -0.3362 0.5881 -0.3919 0.6 -0.4638 C 0.6238 -0.6119 0.7238 -0.7963 0.94 -0.7963 C 1.04 -0.7963 1.1 -0.7638 1.14 -0.72 C 1.0563 -0.6838 0.9881 -0.5763 0.9881 -0.4838 C 0.9881 -0.34 1.1 -0.2281 1.2444 -0.2281 C 1.3881 -0.2281 1.5044 -0.34 1.5044 -0.4838 L 1.5044 -0.4919 L 1.5044 -0.4963 C 1.5044 -0.5319 1.4963 -0.5919 1.48 -0.6238 C 1.4281 -0.7681 1.26 -0.98 0.86 -0.98 C 0.5 -0.98 0.24 -0.6363 0.16 -0.4519 C 0.12 -0.3563 0.06 -0.16 0.06 0.0638 C 0.06 0.3081 0.1281 0.5838 0.3638 0.7919 C 0.5963 0.9681 0.7438 0.9763 0.8838 0.9763 C 1.0244 0.9763 1.5481 0.8119 1.5481 0.3481 C 1.5481 -0.0438 1.24 -0.1919 0.9881 -0.1919 M 0.84 0.8081 C 0.7081 0.8081 0.6 0.6281 0.6 0.4038 C 0.6 0.18 0.7081 -0.0037 0.84 -0.0037 C 0.9719 -0.0037 1.0844 0.18 1.0844 0.4038 C 1.0844 0.6281 0.9719 0.8081 0.84 0.8081',
    offset: { x: 0, y: -.98 },
    width: 1.7,
    height: 1.96,
  },
  {
    id: 'time-signature-7',
    viewBox: '0.06 -1.01 1.39 2.02',
    path: 'M 1.4619 -0.9475 C 1.4619 -0.9938 1.4231 -1.0025 1.4231 -1.0025 L 1.3444 -1.0025 C 1.2994 -1.0025 1.2975 -0.9475 1.2975 -0.9475 C 1.2975 -0.9475 1.2994 -0.6325 1.1306 -0.6325 C 0.9619 -0.6325 0.9138 -0.9763 0.6531 -0.9763 C 0.4044 -0.9763 0.2544 -0.7219 0.2419 -0.6981 L 0.2419 -0.89 C 0.2419 -0.915 0.2213 -0.935 0.1963 -0.935 L 0.105 -0.935 C 0.0806 -0.935 0.0606 -0.915 0.06 -0.89 L 0.06 -0.1519 C 0.06 -0.1275 0.0806 -0.1075 0.105 -0.1069 L 0.1963 -0.1069 C 0.2213 -0.1069 0.2412 -0.1275 0.2419 -0.1519 L 0.2419 -0.2787 C 0.2419 -0.3719 0.3031 -0.4963 0.4425 -0.4963 C 0.5819 -0.4963 0.6019 -0.3406 0.9125 -0.3406 C 0.9125 -0.3406 1.1381 -0.3481 1.1831 -0.3931 C 1.1831 -0.3931 0.7919 0.2894 0.6506 0.4919 C 0.4519 0.7775 0.445 0.925 0.445 0.925 C 0.4425 0.945 0.4394 1 0.5019 1.0013 C 0.565 1.0025 0.605 0.985 0.7331 0.9763 C 0.8613 0.9681 0.995 1.0013 1.0275 1.0013 C 1.0606 1.0013 1.0744 0.9881 1.0856 0.9788 C 1.0925 0.9731 1.0988 0.9663 1.105 0.96 C 1.1163 0.9488 1.1319 0.9344 1.1263 0.9088 C 1.1231 0.895 1.0663 0.6019 1.1319 0.3613 C 1.1831 0.1744 1.3075 -0.1669 1.3975 -0.4194 C 1.485 -0.6625 1.4619 -0.9475 1.4619 -0.9475',
    offset: { x: 0, y: -1.01 },
    width: 1.43,
    height: 2.02,
  },
  {
    id: 'time-signature-8',
    viewBox: '0.06 -.99 1.52 1.99',
    path: 'M 1.295 -0.0719 C 1.4288 -0.1719 1.5206 -0.2994 1.5206 -0.46 C 1.5206 -0.7494 1.205 -0.9838 0.8163 -0.9838 C 0.4269 -0.9838 0.1113 -0.7494 0.1113 -0.46 C 0.1113 -0.2994 0.1512 -0.1556 0.3406 -0.0375 C 0.1581 0.0694 0.06 0.2162 0.06 0.4069 C 0.06 0.73 0.3981 0.9919 0.8163 0.9919 C 1.2338 0.9919 1.5719 0.73 1.5719 0.4069 C 1.5719 0.2162 1.5025 0.0338 1.295 -0.0719 M 0.8156 0.7675 C 0.5613 0.7675 0.34 0.6281 0.34 0.405 C 0.34 0.1369 0.5469 0.0725 0.5469 0.0725 C 0.8188 0.1631 1.2088 0.3006 1.2088 0.5188 C 1.2088 0.6281 1.07 0.7675 0.8156 0.7675 M 1.0713 -0.1819 C 0.7988 -0.2662 0.4994 -0.3981 0.4994 -0.58 C 0.4994 -0.7375 0.6438 -0.7994 0.8156 -0.7994 C 1.0619 -0.7994 1.2319 -0.6838 1.2319 -0.5 C 1.2319 -0.3081 1.1431 -0.2169 1.0713 -0.1819',
    offset: { x: 0, y: -.99 },
    width: 1.52,
    height: 1.99,
  },
  {
    id: 'time-signature-9',
    viewBox: '0.06 -.98 1.49 1.96',
    path: 'M 0.62 0.1881 C 0.8638 0.1881 0.9519 0.1163 1.0081 0.0563 C 1.02 0.14 1.0281 0.2038 1.0281 0.2681 C 1.0281 0.3319 1.02 0.3881 1.0081 0.46 C 0.9838 0.6081 0.8838 0.7919 0.6681 0.7919 C 0.5681 0.7919 0.5081 0.76 0.4681 0.7163 C 0.5519 0.68 0.62 0.5719 0.62 0.48 C 0.62 0.3362 0.5081 0.2238 0.3638 0.2238 C 0.22 0.2238 0.1038 0.3362 0.1038 0.48 L 0.1038 0.4881 L 0.1038 0.4919 C 0.1038 0.5281 0.1119 0.5881 0.1281 0.62 C 0.18 0.7638 0.3481 0.9763 0.7481 0.9763 C 1.1081 0.9763 1.3681 0.6319 1.4481 0.4481 C 1.4881 0.3519 1.5481 0.1563 1.5481 -0.0681 C 1.5481 -0.3119 1.48 -0.5881 1.2444 -0.7963 C 1.0119 -0.9719 0.8638 -0.98 0.7238 -0.98 C 0.5838 -0.98 0.06 -0.8163 0.06 -0.3519 C 0.06 0.04 0.3681 0.1881 0.62 0.1881 M 0.7681 -0.8163 C 0.9 -0.8163 1.0081 -0.6319 1.0081 -0.4081 C 1.0081 -0.1837 0.9 -0.0037 0.7681 -0.0037 C 0.6363 -0.0037 0.5238 -0.1837 0.5238 -0.4081 C 0.5238 -0.6319 0.6363 -0.8163 0.7681 -0.8163',
    offset: { x: 0, y: -.98 },
    width: 1.49,
    height: 1.96,
  },
  {
    id: 'time-signature-0',
    viewBox: '0.06 -1.02 1.5 2.04',
    path: 'M 0.8081 -1.02 C 0.3838 -1.02 0.06 -0.58 0.06 0 C 0.06 0.58 0.3838 1.0163 0.8081 1.0163 C 1.2319 1.0163 1.5563 0.58 1.5563 0 C 1.5563 -0.58 1.2319 -1.02 0.8081 -1.02 M 1.0444 -0.5563 L 1.0444 0.5563 C 1.0444 0.7 0.98 0.8563 0.8081 0.8563 C 0.6363 0.8563 0.5719 0.7 0.5719 0.5563 L 0.5719 -0.5563 C 0.5719 -0.7 0.6363 -0.8563 0.8081 -0.8563 C 0.98 -0.8563 1.0444 -0.7 1.0444 -0.5563',
    offset: { x: 0, y: -1.02 },
    width: 1.5,
    height: 2.04,
  },
  {
    id: 'time-signature-c',
    viewBox: '0 -1.04 1.86 2.07',
    path: 'M 1.3 -0.7163 C 1.2 -0.6519 1.1281 -0.5363 1.1281 -0.4081 C 1.1281 -0.3919 1.1281 -0.3763 1.1319 -0.36 C 1.1519 -0.1963 1.2844 -0.0681 1.4481 -0.0481 L 1.4919 -0.0481 C 1.6919 -0.0481 1.8519 -0.2081 1.8519 -0.4081 L 1.8519 -0.4319 C 1.8519 -0.4481 1.8481 -0.4763 1.8444 -0.4919 C 1.8081 -0.6638 1.6519 -1.0319 0.9719 -1.0319 C 0.1 -1.0319 0 -0.3081 0 -0.0481 C 0 0.4281 0.06 1.0244 1.06 1.0244 C 1.4563 1.0244 1.7644 0.7919 1.78 0.3638 C 1.78 0.3438 1.7681 0.3319 1.7481 0.3319 L 1.6963 0.3319 C 1.68 0.3319 1.6644 0.3481 1.6644 0.3638 C 1.6481 0.6963 1.4119 0.8963 1.06 0.8963 C 0.7119 0.8963 0.5438 0.7081 0.5438 0.3563 L 0.5438 -0.4081 C 0.5438 -0.6319 0.6319 -0.8881 0.9881 -0.8881 C 1.1763 -0.8881 1.26 -0.82 1.3044 -0.7519 C 1.3119 -0.7363 1.3119 -0.7238 1.3 -0.7163',
    offset: { x: 0, y: -1.04 },
    width: 1.86,
    height: 2.07,
  },
];

export default class TimeSignature extends StaffItem {
  #numerator;
  #denominator;
  #cutTime;
  #cutTimeElement;
  #numeratorSymbols;
  #denominatorSymbols;
  #numeratorElement;
  #denominatorElement;

  constructor(options) {
    if (typeof options === 'string') {
      const parts = options.split('/');
      options = { numerator: parts[0], denominator: parts[1] };
    }

    super(options);
    this.create(options);
  }
  
  createElement(options) {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.setAttribute('class', 'time-signature');
  }

  setParent(parent) {
    super.setParent(parent);
    this.updateSymbol();
  }

  set numerator(value) {
    this.#numerator = value;
    this.updateSymbol();
  }

  set denominator(value) {
    this.#denominator = value;
    this.updateSymbol();
  }

  set cutTime(value) {
    this.#cutTime = !!value;
    this.updateSymbol();
  }

  get cutTime() {
    return this.#cutTime;
  }

  updateSymbol() {
    this.#numeratorSymbols = this.#numerator.split('')
      .map(n => symbols.find(s => s.id === 'time-signature-' + n));
    if (!this.#numeratorSymbols.length)
      return;
    this.addSymbolIfNotExists(...this.#numeratorSymbols);

    if (this.#denominator) {
      this.#denominatorSymbols = this.#denominator.split('')
        .map(n => symbols.find(s => s.id === 'time-signature-' + n));
      if (!this.#denominatorSymbols.length)
        return;
      this.addSymbolIfNotExists(...this.#denominatorSymbols);
    }

    this.update();
  }

  update() {
    if (!this.parent && (this.#numeratorSymbols.length || this.#denominatorSymbols.length))
      return;

    const numeratorWidth = this.#numeratorSymbols?.reduce((sum, s) => sum += s?.width ?? 0, 0) ?? 0;
    const denominatorWidth = this.#denominatorSymbols?.reduce((sum, s) => sum += s?.width ?? 0, 0) ?? 0;
    this.width = Math.max(numeratorWidth, denominatorWidth);
    const y = -Math.floor(this.staffLineCount / 2);

    if (this.#numerator && this.#numeratorSymbols.length) {  
      if (!this.#numeratorElement) {
        this.#numeratorElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.#numeratorElement.setAttribute('class', 'numerator');
        this.element.appendChild(this.#numeratorElement);
      }
      if (this.#denominator && this.#denominatorSymbols.length)
        this.#numeratorElement.setAttribute('transform', `translate(0, ${y - 1})`);
      else
        this.#numeratorElement.setAttribute('transform', `translate(0, ${y})`);

      let x = (this.width - numeratorWidth) / 2;
      for (let i = 0; i < this.#numeratorSymbols.length; i++) {
        const symbol = this.#numeratorSymbols[i];
        let element = this.#numeratorElement.children[i];

        if (!element) {
          element = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          element.setAttribute('class', 'numerator');
          this.#numeratorElement.appendChild(element);
        }

        element.setAttribute('href', `#${symbol.id}`);
        element.setAttribute('width', symbol.width);
        element.setAttribute('height', symbol.height);
        element.setAttribute('x', x + symbol.offset.x);
        element.setAttribute('y', symbol.offset.y);
        x += symbol.width;
      }

      while(this.#numeratorElement.children.length > this.#numeratorSymbols.length)
        this.#numeratorElement.removeChild(this.#numeratorElement.lastChild);
    }

    if (this.#denominator && this.#denominatorSymbols.length) {
      if (this.#cutTimeElement) {
        this.element.removeChild(this.#cutTimeElement);
        this.#cutTimeElement = null;
      }

      if (!this.#denominatorElement) {
        this.#denominatorElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.#denominatorElement.setAttribute('class', 'denominator');
        this.element.appendChild(this.#denominatorElement);
      }
      this.#denominatorElement.setAttribute('transform', `translate(0, ${y + 1})`);

      let x = (this.width - denominatorWidth) / 2;
      for (let i = 0; i < this.#denominatorSymbols.length; i++) {
        const symbol = this.#denominatorSymbols[i];
        let element = this.#denominatorElement.children[i];

        if (!element) {
          element = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          element.setAttribute('class', 'denominator');
          this.#denominatorElement.appendChild(element);
        }

        element.setAttribute('href', `#${symbol.id}`);
        element.setAttribute('width', symbol.width);
        element.setAttribute('height', symbol.height);
        element.setAttribute('x', x + symbol.offset.x);
        element.setAttribute('y', symbol.offset.y);
        x += symbol.width;
      }

      while(this.#denominatorElement.children.length > this.#denominatorSymbols.length)
        this.#denominatorElement.removeChild(this.#denominatorElement.lastChild);
    } else if (this.cutTime) {
      if (!this.#cutTimeElement) {
        this.#cutTimeElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.#cutTimeElement.setAttribute('class', 'cut-time');
        this.element.appendChild(this.#cutTimeElement);
      }

      const xx = this.width / 2;
      this.#cutTimeElement.setAttribute('x1', xx);
      this.#cutTimeElement.setAttribute('y1', y - 1.5);
      this.#cutTimeElement.setAttribute('x2', xx);
      this.#cutTimeElement.setAttribute('y2', y + 1.5);

    } else {
      if (this.#cutTimeElement) {
        this.element.removeChild(this.#cutTimeElement);
        this.#cutTimeElement = null;
      }
    }

    this.element.setAttribute('transform', `translate(${this.x ?? 0}, ${this.y})`);
  }
}