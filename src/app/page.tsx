"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { QrCode, MapPin, Clock, Package, Scan, Plus, Eye, Navigation, Download, Printer } from 'lucide-react'
import QRCode from 'qrcode'

interface LocationData {
  latitude: number
  longitude: number
  timestamp: Date
  address?: string
}

interface TrackedObject {
  id: string
  name: string
  qrCode: string
  lastLocation?: LocationData
  locationHistory: LocationData[]
  createdAt: Date
}

export default function QRTrackingApp() {
  const [objects, setObjects] = useState<TrackedObject[]>([])
  const [selectedObject, setSelectedObject] = useState<TrackedObject | null>(null)
  const [selectedObjectForQR, setSelectedObjectForQR] = useState<TrackedObject | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [newObjectName, setNewObjectName] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simular alguns objetos de exemplo
  useEffect(() => {
    const sampleObjects: TrackedObject[] = [
      {
        id: '1',
        name: 'Notebook Dell',
        qrCode: 'QR_NOTEBOOK_001',
        lastLocation: {
          latitude: -23.5505,
          longitude: -46.6333,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          address: 'São Paulo, SP'
        },
        locationHistory: [
          {
            latitude: -23.5505,
            longitude: -46.6333,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            address: 'São Paulo, SP'
          },
          {
            latitude: -23.5489,
            longitude: -46.6388,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            address: 'Avenida Paulista, SP'
          }
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Câmera Canon',
        qrCode: 'QR_CAMERA_002',
        lastLocation: {
          latitude: -22.9068,
          longitude: -43.1729,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          address: 'Rio de Janeiro, RJ'
        },
        locationHistory: [
          {
            latitude: -22.9068,
            longitude: -43.1729,
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            address: 'Rio de Janeiro, RJ'
          }
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]
    setObjects(sampleObjects)
  }, [])

  const generateQRCode = async (text: string): Promise<string> => {
    try {
      const qrDataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrDataUrl
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
      return ''
    }
  }

  const handleGenerateQR = async (object: TrackedObject) => {
    setSelectedObjectForQR(object)
    const qrData = await generateQRCode(object.qrCode)
    setQrCodeDataUrl(qrData)
  }

  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !selectedObjectForQR) return

    const link = document.createElement('a')
    link.download = `QR_${selectedObjectForQR.name.replace(/\s+/g, '_')}.png`
    link.href = qrCodeDataUrl
    link.click()
  }

  const printQRCode = () => {
    if (!qrCodeDataUrl || !selectedObjectForQR) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${selectedObjectForQR.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .qr-container {
                max-width: 400px;
                margin: 0 auto;
                border: 2px solid #000;
                padding: 20px;
                border-radius: 10px;
              }
              .qr-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .qr-code {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
              }
              .qr-image {
                max-width: 100%;
                height: auto;
              }
              .instructions {
                font-size: 12px;
                color: #888;
                margin-top: 15px;
                line-height: 1.4;
              }
              @media print {
                body { margin: 0; }
                .qr-container { border: 2px solid #000; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-title">${selectedObjectForQR.name}</div>
              <div class="qr-code">Código: ${selectedObjectForQR.qrCode}</div>
              <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-image" />
              <div class="instructions">
                Escaneie este QR Code diariamente para registrar a localização do objeto.
                <br>Use o aplicativo QR Tracker para fazer o escaneamento.
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          })
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    })
  }

  const handleScanQR = async () => {
    setIsScanning(true)
    
    try {
      // Simular escaneamento de QR Code
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular QR Code escaneado
      const scannedQR = 'QR_NOTEBOOK_001' // Em produção, viria do scanner real
      
      const currentLocation = await getCurrentLocation()
      
      setObjects(prev => prev.map(obj => {
        if (obj.qrCode === scannedQR) {
          return {
            ...obj,
            lastLocation: currentLocation,
            locationHistory: [currentLocation, ...obj.locationHistory]
          }
        }
        return obj
      }))
      
      alert('Localização registrada com sucesso!')
    } catch (error) {
      console.error('Erro ao escanear QR:', error)
      alert('Erro ao registrar localização. Verifique as permissões de localização.')
    } finally {
      setIsScanning(false)
    }
  }

  const addNewObject = () => {
    if (!newObjectName.trim()) return

    const newObject: TrackedObject = {
      id: Date.now().toString(),
      name: newObjectName,
      qrCode: `QR_${newObjectName.toUpperCase().replace(/\s+/g, '_')}_${Date.now()}`,
      locationHistory: [],
      createdAt: new Date()
    }

    setObjects(prev => [...prev, newObject])
    setNewObjectName('')
    setShowAddDialog(false)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Há poucos minutos'
    if (diffInHours < 24) return `Há ${diffInHours} horas`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Há ${diffInDays} dias`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header com Neon Effect */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-3xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl shadow-2xl">
                <QrCode className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                QR TRACKER
              </h1>
              <div className="h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full mt-2 shadow-lg shadow-purple-500/50"></div>
            </div>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            🚀 <span className="text-cyan-400 font-semibold">Rastreamento Inteligente</span> em tempo real. 
            Gere QR Codes únicos e monitore seus objetos com tecnologia de ponta.
          </p>
        </div>

        <Tabs defaultValue="objects" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-10 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-2">
            <TabsTrigger 
              value="objects" 
              className="flex items-center gap-3 text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Package className="w-5 h-5" />
              💎 Meus Objetos
            </TabsTrigger>
            <TabsTrigger 
              value="scan" 
              className="flex items-center gap-3 text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <Scan className="w-5 h-5" />
              📱 Escanear QR
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="flex items-center gap-3 text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <MapPin className="w-5 h-5" />
              🗺️ Mapa
            </TabsTrigger>
          </TabsList>

          {/* Lista de Objetos */}
          <TabsContent value="objects" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">
                💎 <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Objetos Rastreados</span>
              </h2>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold px-8 py-3 rounded-2xl shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105">
                    <Plus className="w-5 h-5 mr-2" />
                    ✨ Adicionar Objeto
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      ✨ Adicionar Novo Objeto
                    </DialogTitle>
                    <DialogDescription className="text-gray-300 text-lg">
                      Crie um novo objeto para rastreamento. Um QR Code único será gerado automaticamente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="objectName" className="text-cyan-400 font-semibold text-lg">Nome do Objeto</Label>
                      <Input
                        id="objectName"
                        value={newObjectName}
                        onChange={(e) => setNewObjectName(e.target.value)}
                        placeholder="Ex: Notebook, Câmera, Tablet..."
                        className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 text-lg py-3 mt-2"
                      />
                    </div>
                    <Button 
                      onClick={addNewObject} 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-xl"
                    >
                      🚀 Criar Objeto
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {objects.map((object) => (
                <Card key={object.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-105 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-white">{object.name}</CardTitle>
                      <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0 px-3 py-1 text-xs font-bold">
                        {object.qrCode}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {object.lastLocation ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300">
                          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{object.lastLocation.address}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="p-2 bg-slate-700 rounded-full">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span>{formatTimeAgo(object.lastLocation.timestamp)}</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-4 py-2 font-bold">
                          ✅ Localizado
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-500">
                          <div className="p-2 bg-slate-700 rounded-full">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span>Localização não registrada</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 font-bold">
                          ⏳ Aguardando scan
                        </Badge>
                      </div>
                    )}
                    
                    {/* BOTÕES PRINCIPAIS - NEON STYLE */}
                    <div className="space-y-3">
                      {/* Botão QR Code MEGA DESTAQUE */}
                      <Button
                        onClick={() => handleGenerateQR(object)}
                        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white border-0 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/75 transition-all duration-300 hover:scale-105 font-black text-lg py-4 rounded-xl"
                        size="lg"
                      >
                        <QrCode className="w-6 h-6 mr-3" />
                        🎯 GERAR QR CODE
                      </Button>
                      
                      {/* Botão Histórico com estilo neon */}
                      <Button
                        onClick={() => setSelectedObject(object)}
                        className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-cyan-400 border border-cyan-500/50 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 font-semibold py-3 rounded-xl"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        📊 Ver Histórico
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {objects.length === 0 && (
              <Card className="text-center py-16 bg-slate-800/30 backdrop-blur-sm border-slate-700 rounded-3xl">
                <CardContent>
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                    <Package className="w-24 h-24 text-gray-400 mx-auto relative z-10" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    🚀 Nenhum objeto cadastrado
                  </h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    Adicione seu primeiro objeto para começar o rastreamento inteligente
                  </p>
                  <Button 
                    onClick={() => setShowAddDialog(true)}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg rounded-2xl shadow-2xl shadow-purple-500/25"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    ✨ Adicionar Primeiro Objeto
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Scanner QR */}
          <TabsContent value="scan" className="space-y-8">
            <Card className="max-w-lg mx-auto bg-slate-800/50 backdrop-blur-sm border-slate-700 rounded-3xl overflow-hidden">
              <CardHeader className="text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-white">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                    <Scan className="w-8 h-8 text-white" />
                  </div>
                  📱 Scanner QR Code
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Escaneie o QR Code do seu objeto para registrar a localização atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden border-2 border-slate-700">
                  {/* Scanning Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse"></div>
                  
                  {isScanning ? (
                    <div className="text-center relative z-10">
                      <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-cyan-500 border-r-purple-500 mx-auto"></div>
                        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-cyan-500 opacity-20"></div>
                      </div>
                      <p className="text-cyan-400 font-semibold text-lg">🔍 Escaneando...</p>
                    </div>
                  ) : (
                    <div className="text-center relative z-10">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <QrCode className="w-20 h-20 text-gray-400 mx-auto relative z-10" />
                      </div>
                      <p className="text-gray-400 font-medium">Clique para escanear</p>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleScanQR}
                  disabled={isScanning}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 text-lg rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-transparent border-t-white mr-3"></div>
                      🔍 Escaneando...
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5 mr-3" />
                      🚀 Iniciar Scanner
                    </>
                  )}
                </Button>

                <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700">
                  <h4 className="text-cyan-400 font-bold mb-4 text-lg">📋 Instruções:</h4>
                  <div className="space-y-3 text-gray-300">
                    <p className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                      Permita acesso à câmera quando solicitado
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                      Posicione o QR Code dentro do quadro
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                      A localização será registrada automaticamente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mapa */}
          <TabsContent value="map" className="space-y-8">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-900/50 to-orange-900/50">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  🗺️ Mapa de Localizações
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Visualize as últimas localizações dos seus objetos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center border-2 border-slate-700 relative overflow-hidden">
                  {/* Map Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20"></div>
                  </div>
                  
                  <div className="text-center relative z-10">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                      <Navigation className="w-20 h-20 text-gray-400 mx-auto relative z-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      🗺️ Mapa Interativo
                    </h3>
                    <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                      Em uma implementação completa, aqui seria exibido um mapa interativo 
                      mostrando as localizações de todos os objetos rastreados.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <h4 className="font-bold text-xl text-white">📍 Objetos com Localização:</h4>
                  {objects.filter(obj => obj.lastLocation).map((object) => (
                    <div key={object.id} className="flex items-center justify-between p-6 bg-slate-900/50 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300">
                      <div>
                        <p className="font-bold text-white text-lg">{object.name}</p>
                        <p className="text-cyan-400 font-medium">{object.lastLocation?.address}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 font-bold">
                        {formatTimeAgo(object.lastLocation!.timestamp)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Histórico */}
        {selectedObject && (
          <Dialog open={!!selectedObject} onOpenChange={() => setSelectedObject(null)}>
            <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  📊 Histórico de Localizações
                </DialogTitle>
                <DialogDescription className="text-gray-300 text-lg">
                  {selectedObject.name} - {selectedObject.qrCode}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedObject.locationHistory.length > 0 ? (
                  selectedObject.locationHistory.map((location, index) => (
                    <div key={index} className="flex items-start gap-4 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                      <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">{location.address}</p>
                        <p className="text-gray-400 font-medium">
                          {location.timestamp.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                        </p>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 font-bold">
                          ✅ Atual
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full blur-xl opacity-20"></div>
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto relative z-10" />
                    </div>
                    <p className="text-gray-400 text-xl font-semibold">Nenhuma localização registrada ainda</p>
                    <p className="text-gray-500 mt-2">Escaneie o QR Code para registrar a primeira localização</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de QR Code - ULTRA NEON STYLE */}
        {selectedObjectForQR && (
          <Dialog open={!!selectedObjectForQR} onOpenChange={() => setSelectedObjectForQR(null)}>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-3xl font-black">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  🎯 QR Code Gerado com Sucesso!
                </DialogTitle>
                <DialogDescription className="text-gray-300 text-xl">
                  <strong className="text-cyan-400">{selectedObjectForQR.name}</strong> - Código: {selectedObjectForQR.qrCode}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-8">
                {qrCodeDataUrl && (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                      <div className="relative bg-white p-8 rounded-3xl border-4 border-purple-400 shadow-2xl shadow-purple-500/50">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="QR Code" 
                          className="w-80 h-80 mx-auto"
                        />
                      </div>
                    </div>
                    <p className="text-green-400 font-bold text-lg mt-6">
                      ✅ QR Code pronto para impressão e uso!
                    </p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button 
                    onClick={downloadQRCode}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl py-6 rounded-2xl shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
                    size="lg"
                  >
                    <Download className="w-6 h-6 mr-3" />
                    📥 Baixar PNG
                  </Button>
                  <Button 
                    onClick={printQRCode}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border-2 border-cyan-500 hover:border-cyan-400 font-bold text-xl py-6 rounded-2xl shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
                    size="lg"
                  >
                    <Printer className="w-6 h-6 mr-3" />
                    🖨️ Imprimir
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-8 rounded-3xl border border-blue-500/30">
                  <h4 className="font-black text-cyan-400 mb-6 text-2xl">📋 Como usar seu QR Code:</h4>
                  <div className="space-y-4">
                    {[
                      "Baixe ou imprima o QR Code em papel resistente",
                      "Cole ou fixe no objeto que deseja rastrear", 
                      "Use a aba \"Escanear QR\" para registrar localizações",
                      "Escaneie diariamente para acompanhar seu objeto!"
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                        <span className="text-gray-300 text-lg font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}