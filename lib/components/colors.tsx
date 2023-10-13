const commonColor = {
    colors: {
      commonWhite: '#FFFFFF',
      commonBlack: '#000000',
    },
  };
  
  const light = {
    colors: {
      themeColor: '#FFFFFF',
      white: '#000000',
      sky: '#DE5E69',
      gray: 'gray',
      ...commonColor.colors,
    },
  };
  
  const dark = {
    colors: {
      themeColor: '#000000',
      white: '#FFFFFF',
      sky: '#831a23',
      gray: 'white',
      ...commonColor.colors,
    },
  };
  
  export default { light, dark };