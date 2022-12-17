import { useState } from 'react';
import graphics from './graphics';
import styles from './App.module.css';

const MIN_QR_SIZE = 100; // px
const MAX_QR_SIZE = 1000; // px
const MIN_IMG_SIZE = 0.1;
const MAX_IMG_SIZE = 0.5;

const QrInputFields = ({ setOptions }) => {
  const [qrSource, setQrSource] = useState(graphics[0].url);
  const [qrSize, setQrSize] = useState(512);
  const [imageSize, setImageSize] = useState(0.5);

  const [currentLogo, setCurrentLogo] = useState(0);
  const [hasLogo, setHasLogo] = useState(true);
  const [isStyled, setIsStyled] = useState(true);

  const validateQrSize = () => {
    setQrSize((current) => {
      if (current <= MIN_QR_SIZE) {
        return MIN_QR_SIZE;
      } else if (current >= MAX_QR_SIZE) {
        return MAX_QR_SIZE;
      }
      return current;
    });
  };

  const validateImageSize = () => {
    setImageSize((current) => {
      if (current <= MIN_IMG_SIZE) {
        return MIN_IMG_SIZE;
      } else if (current >= MAX_IMG_SIZE) {
        return MAX_IMG_SIZE;
      }
      return current;
    });
  };

  const validateQrSource = () => {
    setQrSource((current) => {
      const trimmedText = String(current).trim();
      if (!trimmedText || trimmedText.length > 3500)
        return graphics[currentLogo].url;
      return trimmedText;
    });
  };

  // validate all input fields and update qrcode
  const validate = () => {
    validateQrSize();
    validateImageSize();
    validateQrSource();
    updateOptions();
  };

  const updateOptions = () => {
    const logo = graphics[currentLogo];
    const newOptions = {
      width: qrSize,
      height: qrSize,
      type: 'svg',
      data: qrSource,
      image: hasLogo && `${process.env.PUBLIC_URL}/images/${logo.image}`,
      imageOptions: {
        imageSize,
        margin: logo.margin,
      },
      cornersSquareOptions: {
        color: isStyled && logo.colors.dark,
        type: isStyled && 'extra-rounded',
      },
      cornersDotOptions: {
        color: isStyled && logo.colors.bright,
      },
    };
    setOptions(newOptions);
  };

  return (
    <>
      <div className={styles.iconsContainer}>
        {graphics.map((logo, i) => (
          <label className={styles.icon} key={logo.name}>
            <img
              src={`${process.env.PUBLIC_URL}/images/${logo.image}`}
              className={styles.rskImage}
              alt={`${logo.name} logo`}
            />
            <input
              checked={i === currentLogo}
              type="radio"
              value={i}
              onChange={(e) => setCurrentLogo(Number(e.target.value))}
            />
          </label>
        ))}
      </div>
      <label htmlFor="qr-source">
        String to encode
        <input
          id="qr-source"
          type="url"
          value={qrSource}
          onChange={(e) => setQrSource(e.target.value)}
          className={styles.sourceInput}
          onKeyDown={(e) => e.key === 'Enter' && validateQrSource()}
        />
      </label>
      <label htmlFor="place-logo">
        {`Place ${graphics[currentLogo].name} logo`}
        <input
          type="checkbox"
          id="place-logo"
          checked={hasLogo}
          onChange={(e) => setHasLogo(e.target.checked)}
        />
      </label>
      <label htmlFor="is-styled">
        Styled QR code
        <input
          type="checkbox"
          id="is-styled"
          checked={isStyled}
          onChange={(e) => setIsStyled(e.target.checked)}
        />
      </label>
      <label htmlFor="qr-size">
        {`QR size (${MIN_QR_SIZE}px - ${MAX_QR_SIZE}px)`}
        <input
          type="number"
          min={MIN_QR_SIZE}
          max={MAX_QR_SIZE}
          step="10"
          id="qr-size"
          value={qrSize}
          onChange={(e) => setQrSize(e.target.value)}
          className={styles.numberInput}
          onKeyDown={(e) => e.key === 'Enter' && validateQrSize()}
        />
      </label>
      <label htmlFor="image-size">
        {`Image size (${MIN_IMG_SIZE} - ${MAX_IMG_SIZE})`}
        <input
          type="number"
          min={MIN_IMG_SIZE}
          max={MAX_IMG_SIZE}
          step="0.05"
          id="image-size"
          value={imageSize}
          onChange={(e) => setImageSize(e.target.value)}
          className={styles.numberInput}
          onKeyDown={(e) => e.key === 'Enter' && validateImageSize()}
        />
      </label>
      <button
        type="button"
        onClick={validate}
        onKeyDown={(e) => e.key === 'Enter' && validate()}
      >
        Update QR code
      </button>
    </>
  );
};

export default QrInputFields;
