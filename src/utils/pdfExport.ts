import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

/**
 * Convert an image URL to base64
 * @param imageUrl URL of the image
 * @returns Promise resolving to base64 string
 */
const getBase64FromImageUrl = async (imageUrl: string): Promise<string | null> => {
  if (!imageUrl) return null;

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

/**
 * Export a table or element to PDF
 * @param element The HTML element to export
 * @param filename The name of the PDF file (without .pdf extension)
 * @param options Optional configuration for PDF export
 * @param fullData Optional full dataset for comprehensive export
 */
export const exportToPDF = async (
  element: HTMLElement, 
  filename: string = 'Report', 
  options: {
    orientation?: 'portrait' | 'landscape';
    format?: 'a2' | 'a3' | 'a4';
    scale?: number;
    fullDataExport?: boolean;
    includeImages?: boolean;
  } = {},
  fullData?: any[]
) => {
  if (!element) return;

  try {
    // If full data export is requested and data is provided
    if (options.fullDataExport && fullData) {
      // If images are to be included, convert them to base64
      if (options.includeImages) {
        const processedData = await Promise.all(
          fullData.map(async (item) => {
            const processedItem: any = {};
            
            // Check for image fields and convert to base64
            const imageFields = [
              'Before Surgery Image', 
              'After Surgery Image', 
              'Relocation Image',
              'before_surgery_image',
              'after_surgery_image',
              'relocation_image'
            ];

            // Copy non-image fields
            for (const [key, value] of Object.entries(item)) {
              if (!imageFields.includes(key)) {
                processedItem[key] = value;
              }
            }

            // Process image fields
            for (const field of imageFields) {
              if (item[field]) {
                try {
                  const base64Image = await getBase64FromImageUrl(item[field]);
                  if (base64Image) {
                    processedItem[field] = base64Image;
                  }
                } catch (error) {
                  console.error(`Error processing ${field}:`, error);
                }
              }
            }

            return processedItem;
          })
        );

        fullData = processedData;
      }

      // Create a temporary table with full data
      const tempTable = document.createElement('table');
      tempTable.style.width = '100%';
      tempTable.style.borderCollapse = 'collapse';

      // Create table headers
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      Object.keys(fullData[0] || {}).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      tempTable.appendChild(thead);

      // Create table body
      const tbody = document.createElement('tbody');
      fullData.forEach(item => {
        const tr = document.createElement('tr');
        Object.entries(item).forEach(([key, value]) => {
          const td = document.createElement('td');
          
          // Check if value is a base64 image
          if (typeof value === 'string' && value.startsWith('data:image')) {
            // Create a container for the image and its heading
            const imageContainer = document.createElement('div');
            imageContainer.style.display = 'flex';
            imageContainer.style.flexDirection = 'column';
            imageContainer.style.alignItems = 'center';

            // Create heading for the image
            const imageHeading = document.createElement('h4');
            imageHeading.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            imageHeading.style.margin = '8px 0';
            imageHeading.style.fontSize = '12px';
            imageHeading.style.fontWeight = 'bold';

            // Create the image element
            const img = document.createElement('img');
            img.src = value;
            img.style.maxWidth = '150px';
            img.style.maxHeight = '150px';
            img.style.objectFit = 'contain';
            img.style.border = '1px solid #ddd';
            img.style.borderRadius = '4px';

            // Append heading and image to container
            imageContainer.appendChild(imageHeading);
            imageContainer.appendChild(img);

            // Append container to table cell
            td.appendChild(imageContainer);
          } else {
            td.textContent = value !== null && value !== undefined ? String(value) : 'N/A';
          }
          
          td.style.border = '1px solid #ddd';
          td.style.padding = '8px';
          td.style.textAlign = 'center';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      tempTable.appendChild(tbody);

      // Append to body temporarily
      document.body.appendChild(tempTable);

      // Create canvas of the full data table
      const canvas = await html2canvas(tempTable, {
        scale: options.scale || 2,
        useCORS: true,
        logging: false
      });

      // Remove temporary table
      document.body.removeChild(tempTable);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: options.orientation || 'landscape',
        unit: 'px',
        format: options.format || 'a2'
      });

      // Add image to PDF
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}_Full_Dataset.pdf`);
    } else {
      // Original export method for visible content
      const canvas = await html2canvas(element, {
        scale: options.scale || 2,
        useCORS: true,
        logging: false
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: options.orientation || 'landscape',
        unit: 'px',
        format: options.format || 'a2'
      });

      // Add image to PDF
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    }
  } catch (err) {
    console.error('PDF Export Error:', err);
    alert('Failed to export PDF. Please try again.');
  }
}; 