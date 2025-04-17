import { useEffect, useRef } from 'react';
import { BarcodeItem, BarcodeSettings } from '@/lib/utils/barcodeUtils';
import JsBarcode from 'jsbarcode';

interface BarcodePreviewProps {
  item: BarcodeItem;
  settings: BarcodeSettings;
  customHeading?: string;
}

export function BarcodePreview({
  item,
  settings,
  customHeading = settings.customHeading // Use settings.customHeading as default
}: BarcodePreviewProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get dimensions from settings
  const [width, height] = settings.size.split('x').map(Number);

  // Scale factor for display (makes the preview larger on screen)
  // Adjust scale factor based on size to ensure content fits
  const getScaleFactor = () => {
    // Smaller sizes need larger scale factors to be visible
    if (width <= 40) return 6;
    if (width <= 50) return 5;
    return 4; // For larger sizes
  };

  const scaleFactor = getScaleFactor();

  // Format barcode value based on barcode type
  const formatBarcodeValue = (id: string, type: 'CODE128' | 'EAN13' | 'UPC'): string => {
    if (type === 'EAN13') {
      // EAN13 requires 12 or 13 numeric digits
      return '590123412345'; // Sample valid EAN13 code
    } else if (type === 'UPC') {
      // UPC requires 11 or 12 numeric digits
      return '012345678905'; // Sample valid UPC code
    } else {
      // CODE128 can handle alphanumeric
      return id;
    }
  };

  // Calculate font sizes based on container dimensions
  const getTextSizes = () => {
    // Base size on the width of the container - increased for better legibility
    const baseFontSize = Math.max(width * 0.1, 7); // Minimum 7px

    return {
      headingSize: baseFontSize * 1.2,
      titleSize: baseFontSize,
      detailSize: baseFontSize
    };
  };

  const textSizes = getTextSizes();

  // Generate the barcode when props change
  useEffect(() => {
    if (barcodeRef.current) {
      try {
        // Calculate appropriate barcode dimensions based on container size
        // Adjust height based on whether we have heading and title
        const contentHeight = height * scaleFactor;
        const headingSpace = customHeading ? contentHeight * 0.18 : 0; // Increased for larger font
        const detailsSpace = contentHeight * 0.15; // Increased for larger font at bottom

        // Available height for barcode - reduced to fit content
        const availableHeight = contentHeight - headingSpace - detailsSpace;
        const barcodeHeight = Math.min(availableHeight * 0.65, height * 0.35 * scaleFactor); // Slightly reduced

        // Adjust width based on container width
        const barcodeWidth = Math.max(1, width * 0.03); // Min 1px, scales with container width

        // Format the barcode value based on the selected type
        const barcodeValue = formatBarcodeValue(item.id, settings.type);

        JsBarcode(barcodeRef.current, barcodeValue, {
          format: settings.type,
          width: barcodeWidth,
          height: barcodeHeight,
          displayValue: true,
          textMargin: 2,
          fontSize: Math.max(8, width * 0.2), // Scale font with container width
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000'
        });
      } catch (error) {
        console.error('Error generating barcode:', error);

        // Fallback to CODE128 if the selected format fails
        const barcodeHeight = height * 0.4 * scaleFactor;

        JsBarcode(barcodeRef.current, item.id, {
          format: 'CODE128',
          width: Math.max(1, width * 0.03),
          height: barcodeHeight,
          displayValue: true,
          textMargin: 2,
          fontSize: Math.max(8, width * 0.2),
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000'
        });
      }
    }
  }, [item.id, settings.type, settings.size, width, height, scaleFactor, customHeading, settings.includeTitle, settings.includePrice, settings.includeLanguage]);

  return (
    <div className="barcode-preview-container flex flex-col items-center w-full">
      <div className="text-xs text-muted-foreground mb-2">
        {settings.size} ({width}mm × {height}mm)
      </div>
      <div
        ref={containerRef}
        className="rounded-md border bg-white overflow-hidden flex flex-col items-center justify-between shadow-sm w-full max-w-[400px]"
        style={{
          width: `${width * scaleFactor}px`,
          height: `${height * scaleFactor}px`,
          padding: `${Math.max(1, width * 0.02) * scaleFactor}px`, // Reduced padding to fit more content
          transform: 'scale(1)',
          transformOrigin: 'top center'
        }}
      >
        {/* Custom heading at the top */}
        {customHeading && (
          <div className="text-center font-bold w-full overflow-hidden text-ellipsis whitespace-nowrap"
            style={{
              fontSize: `${textSizes.headingSize}px`,
              marginBottom: `${Math.max(1, height * 0.01) * scaleFactor}px`,
              lineHeight: '1.1'
            }}>
            {customHeading}
          </div>
        )}

        {/* Barcode in the middle */}
        <div className="flex items-center justify-center w-full" style={{ margin: '0px' }}>
          <svg ref={barcodeRef} className="max-w-full"></svg>
        </div>

        {/* Details row at the bottom - always show this container for consistent layout */}
        <div className="flex justify-between w-full items-center"
          style={{
            fontSize: `${textSizes.detailSize}px`,
            marginTop: `${Math.max(1, height * 0.01) * scaleFactor}px`,
            minHeight: `${Math.max(5, height * 0.08) * scaleFactor}px`
          }}>
          {/* Left: Language if enabled */}
          <div className="text-left flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium">
            {settings.includeLanguage && item.language && item.language !== 'none' ? (
              <span>{item.language}</span>
            ) : <span></span>}
          </div>

          {/* Middle: Title if enabled */}
          <div className="text-center flex-2 mx-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium"
            style={{ maxWidth: '50%' }}>
            {settings.includeTitle ? item.name : ''}
          </div>

          {/* Right: Price if enabled */}
          <div className="text-right flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium">
            {settings.includePrice && item.price ? (
              <span>₹{item.price}</span>
            ) : <span></span>}
          </div>
        </div>
      </div>
    </div>
  );
}
