import { useState, useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import styles from './App.module.css';
import QrInputFields from './QrInputFields';

const getQrCode = (options) =>
  new QRCodeStyling(JSON.parse(JSON.stringify(options)));

function App() {
  const [options, setOptions] = useState({ data: '' });
  const qrRef = useRef();

  useEffect(() => {
    const targetDiv = qrRef.current;
    targetDiv.innerHTML = '';
    const qrCode = getQrCode(options);
    qrCode.append(targetDiv);
  }, [options]);

  const downloadImage = () => {
    const qrCode = getQrCode(options);
    qrCode.download({
      name: String(options.data).replace(/[\W]+/g, '_'),
      extension: 'png',
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Generate QR-codes with IOVLabs logos</h1>
      <QrInputFields setOptions={setOptions} />
      <div ref={qrRef} />
      <button type="button" onClick={downloadImage}>
        Download PNG
      </button>
      <div>
        <p>
          Brought to you with ❤️ by the Developer Experience team @ IOV Labs!
        </p>
      </div>
    </div>
  );
}

export default App;
