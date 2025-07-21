import type { SpringOptions } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  checkDeviceOrientationSupport,
  requestDeviceOrientationPermission,
  normalizeOrientationValues,
  isMobileDevice
} from "../utils/deviceOrientation";
import CustomAudioPlayer from './CustomAudioPlayer';

interface TiltedCardProps {
  imageSrc: string;
  altText: string;
  captionText: string;
  containerHeight: string;
  containerWidth: string;
  scaleOnHover: number;
  rotateAmplitude: number;
  imageHeight: string;
  imageWidth: string;
  showMobileWarning: boolean;
  showTooltip: boolean;
  displayOverlayContent: boolean;
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,

  showTooltip = true,
  displayOverlayContent = false,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });

  const [lastY, setLastY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasOrientationPermission, setHasOrientationPermission] = useState(false);
  const [orientationSupported, setOrientationSupported] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(false);

  useEffect(() => {
    // Rimuovere il controllo HTTPS
    setIsSecureContext(true);

    // Animazione di fade-in dall'alto per la card usando CSS Animation
    if (ref.current) {
      ref.current.style.transform = 'translateY(-50px)';
      ref.current.style.opacity = '0';

      // Forza reflow
      ref.current.offsetHeight;

      ref.current.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
      ref.current.style.transform = 'translateY(0)';
      ref.current.style.opacity = '1';
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Test iniziale per device orientation su mobile
  useEffect(() => {
    if (isMobile && isSecureContext) {
      const support = checkDeviceOrientationSupport();
      setOrientationSupported(support.isSupported);
      setHasOrientationPermission(support.hasPermission);
    } else if (isMobile && !isSecureContext) {
      console.warn('Device orientation requires HTTPS or localhost');
      setOrientationSupported(false);
    }
  }, [isMobile, isSecureContext]);

  // Richiesta permessi per device orientation
  const requestOrientationPermission = async () => {
    const granted = await requestDeviceOrientationPermission();
    setHasOrientationPermission(granted);
  };

  useEffect(() => {
    if (!isMobile || !hasOrientationPermission || !orientationSupported) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const { normalizedGamma, normalizedBeta } = normalizeOrientationValues(e.gamma, e.beta, 30);

      // Debug log per verificare che i valori vengano ricevuti
      if (process.env.NODE_ENV === 'development') {
        console.log('Orientation values:', {
          gamma: e.gamma,
          beta: e.beta,
          normalizedGamma,
          normalizedBeta
        });
      }

      // Inverti beta per un movimento più naturale
      rotateX.set(-normalizedBeta * (rotateAmplitude * 0.8));
      rotateY.set(normalizedGamma * (rotateAmplitude * 0.8));
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [rotateAmplitude, isMobile, hasOrientationPermission, orientationSupported, rotateX, rotateY]);

  // Animazione automatica per mobile quando non c'è device orientation
  useEffect(() => {
    if (!isMobile || orientationSupported || isAnimating) return;

    const autoAnimate = () => {
      const time = Date.now() * 0.001;
      const autoRotateX = Math.sin(time * 0.5) * (rotateAmplitude * 0.3);
      const autoRotateY = Math.cos(time * 0.7) * (rotateAmplitude * 0.3);

      rotateX.set(autoRotateX);
      rotateY.set(autoRotateY);
    };

    const interval = setInterval(autoAnimate, 50);
    return () => clearInterval(interval);
  }, [isMobile, isAnimating, rotateAmplitude, rotateX, rotateY, orientationSupported]);
  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current || isMobile) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleTouch(e: React.TouchEvent<HTMLElement>) {
    if (!ref.current || !isMobile) return;

    const touch = e.touches[0];
    if (!touch) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left - rect.width / 2;
    const offsetY = touch.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -(rotateAmplitude * 0.5);
    const rotationY = (offsetX / (rect.width / 2)) * (rotateAmplitude * 0.5);

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(touch.clientX - rect.left);
    y.set(touch.clientY - rect.top);
  }

  function handleTouchStart() {
    if (!isMobile) return;

    // Se non abbiamo ancora richiesto il permesso per l'orientamento, proviamo ora
    if (!hasOrientationPermission && !orientationSupported) {
      requestOrientationPermission();
    }

    setIsAnimating(true);
    scale.set(scaleOnHover * 0.95); // Scala leggermente meno su mobile
    opacity.set(1);
  }

  function handleTouchEnd() {
    if (!isMobile) return;
    setIsAnimating(false);
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  function handleMouseEnter() {
    if (isMobile) return;
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    if (isMobile) return;
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      id="cover"
      ref={ref}
      className="relative w-fit max-h-full [perspective:800px] flex flex-col items-center justify-center rounded-xl"
      style={{
        height: containerHeight,
        width: containerWidth,
        maxWidth: '400px',
        borderRadius: '1rem',
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouchEnd}
    >
      {/* {showMobileWarning && isMobile && (
        <div className="absolute top-4 text-center text-xs px-4 py-2 bg-black/50 rounded-lg text-white backdrop-blur-sm z-10">
          {orientationSupported && hasOrientationPermission
            ? "Inclina il dispositivo per l'effetto 3D"
            : !orientationSupported
              ? "Tocca e trascina per l'effetto 3D"
              : "Tocca per abilitare il giroscopio"}
        </div>
      )} */}

      <motion.div
        className="relative [transform-style:preserve-3d] "
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
          borderRadius: '1rem',
          overflow: 'hidden',
        }}
      >
        <motion.img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover rounded-[15px] will-change-transform [transform:translateZ(0)]"
          style={{
            width: imageWidth,
            height: imageHeight,
          }}
        />

        {displayOverlayContent && (
          <motion.div
            className="absolute -bottom-1/30 left-4 right-4 z-[2] will-change-transform [transform:translateZ(30px)]"
            style={{ borderRadius: '0.5rem' }}
          >
            <CustomAudioPlayer
              src="./0721.mp3"
              className="w-full"
            />
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] opacity-0 z-[3] hidden sm:block"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption,
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
