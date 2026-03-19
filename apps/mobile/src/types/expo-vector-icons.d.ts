declare module '@expo/vector-icons' {
  import * as React from 'react';

  type IoniconComponent = React.ComponentType<any> & {
    glyphMap: Record<string, number>;
  };

  // Keep runtime behavior untouched; this only relaxes JSX typing compatibility.
  export const Ionicons: IoniconComponent;
}
