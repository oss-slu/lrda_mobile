import React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
import { useTheme } from './ThemeProvider';

type Props = SvgProps & {
  color?: string;
  height?: number;
  width?: number;
};

export const SvgIcon: React.FC<Props> = ({ color = 'white', height = 64, width = 80, ...props }) => {
  const { theme } = useTheme();

  // Define the original aspect ratio
  const originalWidth = 75;
  const originalHeight = 60;

  // Maintain the aspect ratio of the viewBox
  const aspectRatio = originalWidth / originalHeight;

  // Ensure the viewBox scales correctly without distortion
  const adjustedHeight = width / aspectRatio;

  return (
    <Svg
      height={height}
      width={width}
      viewBox={`0 0 ${originalWidth} ${originalHeight}`} // Keep the original viewBox
      {...props}
    >
      <Path
        d="M75.2 0v61H0V0c4.1 0 7.4 3.1 7.9 7.1C10 21.7 22.5 33 37.7 33c15.2 0 27.7-11.3 29.7-25.9 0.5-4 3.9-7.1 7.9-7.1h.1z"
        fill={theme.primaryColor}
      />
    </Svg>
  );
};
