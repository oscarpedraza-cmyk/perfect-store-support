import Header from './components/Header'
import UsageStats from './components/UsageStats'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Analyzer from './components/Analyzer'
import DescriptionChecker from './components/DescriptionChecker'
import QualityGuide from './components/QualityGuide'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Header />
      <UsageStats />
      <main>
        <Hero />
        <HowItWorks />
        <Analyzer />
        <DescriptionChecker />
        <QualityGuide />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
