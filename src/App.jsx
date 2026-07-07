import Header from './components/Header'
import UsageStats from './components/UsageStats'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Analyzer from './components/Analyzer'
import QualityGuide from './components/QualityGuide'
import DescriptionChecker from './components/DescriptionChecker'
import KnowledgeHub from './components/KnowledgeHub'
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
        {/* Grupo Fotos */}
        <Analyzer />
        <QualityGuide />
        {/* Grupo Descripciones */}
        <DescriptionChecker />
        {/* Centro de conocimiento */}
        <KnowledgeHub />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
