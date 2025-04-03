export default function InsuranceInfo() {
  return (
    <div className="px-5 py-10 text-center bg-[#0c0058] relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent 0%, #0c0058 100%), 
                            linear-gradient(to right, #ff00ff 1px, transparent 1px), 
                            linear-gradient(to bottom, #ff00ff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center',
          perspective: '1000px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'center top',
          height: '200%',
          top: '-50%'
        }}
      ></div>

      <div className="relative z-10">
        <h2 className="mb-6 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff]">
          Notre Assurance Auto Premium
        </h2>
        <p className="max-w-2xl mx-auto mb-10 text-[#00ffff] text-lg">
          Nous sommes toujours là pour vous protéger, quels que soient les obstacles sur votre route.
        </p>

        <div className="flex flex-wrap justify-around max-w-4xl mx-auto mb-10">
          <div className="w-full p-4 md:w-1/3">
            <div className="h-full p-6 bg-black/60 rounded-lg border-2 border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.5)] backdrop-blur-sm transition-all hover:shadow-[0_0_20px_rgba(255,0,255,0.8)]">
              <h3 className="mb-3 text-xl font-semibold text-[#ff00ff]">Protection Complète</h3>
              <p className="text-[#00ffff]">Couverture tous risques pour votre tranquillité d&apos;esprit</p>
            </div>
          </div>

          <div className="w-full p-4 md:w-1/3">
            <div className="h-full p-6 bg-black/60 rounded-lg border-2 border-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.5)] backdrop-blur-sm transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.8)]">
              <h3 className="mb-3 text-xl font-semibold text-[#00ffff]">Assistance 24/7</h3>
              <p className="text-[#ff00ff]">Nous sommes toujours disponibles en cas d&apos;urgence</p>
            </div>
          </div>

          <div className="w-full p-4 md:w-1/3">
            <div className="h-full p-6 bg-black/60 rounded-lg border-2 border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.5)] backdrop-blur-sm transition-all hover:shadow-[0_0_20px_rgba(255,0,255,0.8)]">
              <h3 className="mb-3 text-xl font-semibold text-[#ff00ff]">Réparations Garanties</h3>
              <p className="text-[#00ffff]">Réseau de garages partenaires pour des réparations de qualité</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button className="px-6 py-3 font-bold cursor-pointer text-black bg-gradient-to-r from-[#ff00ff] to-[#00ffff] rounded-lg hover:from-[#ff33ff] hover:to-[#33ffff] transition-all shadow-[0_0_10px_rgba(0,255,255,0.7)] hover:shadow-[0_0_15px_rgba(0,255,255,0.9)]">
            Demander un Devis
          </button>
          <button className="px-6 py-3 font-bold cursor-pointer text-[#00ffff] bg-transparent border-2 border-[#00ffff] rounded-lg hover:bg-[#00ffff]/10 transition-all shadow-[0_0_10px_rgba(0,255,255,0.4)] hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]">
            En Savoir Plus
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[300px] h-[150px] rounded-t-full bg-gradient-to-t from-[#ff00ff] to-[#ff9900] opacity-30 z-0"
        style={{
          boxShadow: '0 0 40px 10px rgba(255, 0, 255, 0.5)'
        }}
      ></div>
    </div>
  );
}
