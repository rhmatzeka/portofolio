import './SplineTransition.css'

const SplineTransition = () => {
  return (
    <div className="spline-transition">
      <iframe
        src='https://my.spline.design/underwatertransition-3DByBvrBktNoVeNFXxxGcjpg/'
        frameBorder='0'
        className="spline-transition-iframe"
        allow="fullscreen"
      />
      <div className="spline-watermark-overlay"></div>
      <div className="spline-gradient-bottom"></div>
    </div>
  )
}

export default SplineTransition
