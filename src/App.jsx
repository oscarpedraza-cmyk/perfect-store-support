import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Analyzer from './components/Analyzer'
import QualityGuide from './components/QualityGuide'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Analyzer />
        <QualityGuide />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
