import { useState, useEffect } from 'react';
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

  const [validationRequest, setValidationRequest] = useState(0);
  const [validationApprove, setValidationApprove] = useState(0);

  // validate input fields
  useEffect(() => {
    setQrSize((current) =>
      current <= MIN_QR_SIZE
        ? MIN_QR_SIZE
        : current >= MAX_QR_SIZE
        ? MAX_QR_SIZE
        : current,
    );
    setImageSize((current) =>
      current <= MIN_IMG_SIZE
        ? MIN_IMG_SIZE
        : current >= MAX_IMG_SIZE
        ? MAX_IMG_SIZE
        : current,
    );
    setQrSource((c) =>
      c === undefined || c === '' || c.length > 3500
        ? graphics[currentLogo].url
        : c,
    );
    setValidationApprove((v) => v + 1);
  }, [validationRequest, currentLogo, hasLogo, isStyled]);

  // update QRCodeStyling options
  useEffect(() => {
    const logo = graphics[currentLogo];
    setOptions({
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
    });
  }, [validationApprove]);

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      setValidationRequest((v) => v + 1);
    }
  };

  return (
    <>
      <div className={styles.iconsContainer}>
        {graphics.map((logo, i) => (
          <div className={styles.icon} key={logo.name}>
            <img
              src={`${process.env.PUBLIC_URL}/images/${logo.image}`}
              className={styles.rskImage}
              alt={`${logo.name} logo`}
            />
            <input
              checked={i === currentLogo}
              type="radio"
              name="logo"
              value={i}
              onChange={(e) => setCurrentLogo(Number(e.target.value))}
            />
          </div>
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
          onKeyPress={handleEnter}
        />
      </label>
      <label htmlFor="place-logo">
        {`Place ${graphics[currentLogo].name} logo`}
        <input
          type="checkbox"
          id="place-logo"
          checked={hasLogo}
          onChange={(e) => setHasLogo(e.target.checked)}
          onKeyPress={handleEnter}
        />
      </label>
      <label htmlFor="is-styled">
        Styled QR code
        <input
          type="checkbox"
          id="is-styled"
          checked={isStyled}
          onChange={(e) => setIsStyled(e.target.checked)}
          onKeyPress={handleEnter}
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
          onKeyPress={handleEnter}
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
          onKeyPress={handleEnter}
        />
      </label>
      <button
        type="button"
        onClick={() => setValidationRequest((v) => v + 1)}
        onKeyPress={handleEnter}
      >
        Update QR code
      </button>
    </>
  );
};

export default QrInputFields;
