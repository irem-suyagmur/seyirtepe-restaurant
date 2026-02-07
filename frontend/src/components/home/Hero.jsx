import { motion } from 'framer-motion'
import { Parallax } from 'react-parallax'

const Hero = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Parallax Background - Placeholder */}
      <Parallax
        blur={0}
        bgImage="/assets/images/parallax/amik-ovasi.jpg"
        bgImageAlt="Amik Ovası Manzarası"
        strength={200}
        className="h-full w-full"
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

        {/* Content */}
        <div className="relative h-screen flex items-center justify-center">
          <div className="container-custom text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6">
                Seyirtepe
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-light">
                Restaurant & Cafe
              </p>
              <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto">
                Amik Ovası'nın büyüleyici manzarasında lüks yemek deneyimi
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/menu"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors"
                >
                  Menüyü İncele
                </motion.a>
                <motion.a
                  href="/reservation"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-full font-semibold hover:bg-white/20 transition-colors"
                >
                  Rezervasyon Yap
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      </Parallax>

      {/* Alternative: Video Background (commented out) */}
      {/* 
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/videos/amik-ovasi-background.mp4" type="video/mp4" />
        </video>
      </div>
      */}
    </div>
  )
}

export default Hero
