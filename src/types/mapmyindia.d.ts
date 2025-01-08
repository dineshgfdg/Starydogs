declare global {
  interface Window {
    mappls: {
      Map: {
        new (containerId: string, options: {
          center: [number, number];
          zoom: number;
        }): any;
      };
      Marker: {
        new (options: {
          map: any;
          position: { lat: number; lng: number };
          title?: string;
          icon?: { url?: string };
        }): {
          addListener: (event: string, callback: () => void) => void;
          open?: (map: any, marker: any) => void;
        };
      };
      InfoWindow: {
        new (options: { content: string }): {
          open: (map: any, marker: any) => void;
        };
      };
    };
  }
}

export {}; // Ensure this is a module 