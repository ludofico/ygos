import cover from '../public/ygos.jpg'
import './App.css'
import TiltedCard from './components/TiltedCard'

function App() {


  return (
    <div className="flex justify-center items-center h-screen w-full p-4">
      <TiltedCard
        imageSrc={cover}
        altText="24ent logo"
        captionText="24ent"
        containerHeight="auto"
        containerWidth="100%"
        scaleOnHover={1.2}
        rotateAmplitude={6}
        imageHeight="300px"
        imageWidth="300px"
        showMobileWarning={true}
        showTooltip={true}
        displayOverlayContent={true}
      />
    </div>
  )
}

export default App
