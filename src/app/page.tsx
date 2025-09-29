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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              QR Tracker
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rastreie seus objetos em tempo real. Gere QR Codes únicos e escaneie diariamente para registrar localizações.
          </p>
        </div>

        <Tabs defaultValue="objects" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="objects" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Meus Objetos
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Scan className="w-4 h-4" />
              Escanear QR
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Mapa
            </TabsTrigger>
          </TabsList>

          {/* Lista de Objetos */}
          <TabsContent value="objects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Objetos Rastreados</h2>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Objeto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Objeto</DialogTitle>
                    <DialogDescription>
                      Crie um novo objeto para rastreamento. Um QR Code único será gerado automaticamente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="objectName">Nome do Objeto</Label>
                      <Input
                        id="objectName"
                        value={newObjectName}
                        onChange={(e) => setNewObjectName(e.target.value)}
                        placeholder="Ex: Notebook, Câmera, Tablet..."
                      />
                    </div>
                    <Button onClick={addNewObject} className="w-full">
                      Criar Objeto
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {objects.map((object) => (
                <Card key={object.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{object.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {object.qrCode}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {object.lastLocation ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span>{object.lastLocation.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeAgo(object.lastLocation.timestamp)}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Localizado
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>Localização não registrada</span>
                        </div>
                        <Badge variant="secondary">
                          Aguardando scan
                        </Badge>
                      </div>
                    )}
                    
                    {/* BOTÕES PRINCIPAIS - DESTAQUE ESPECIAL PARA QR CODE */}
                    <div className="space-y-2">
                      {/* Botão QR Code em destaque */}
                      <Button
                        onClick={() => handleGenerateQR(object)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                      >
                        <QrCode className="w-5 h-5 mr-2" />
                        🎯 GERAR QR CODE
                      </Button>
                      
                      {/* Botão Histórico secundário */}
                      <Button
                        variant="outline"
                        onClick={() => setSelectedObject(object)}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Histórico
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {objects.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nenhum objeto cadastrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Adicione seu primeiro objeto para começar o rastreamento
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Objeto
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Scanner QR */}
          <TabsContent value="scan" className="space-y-6">
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Scan className="w-6 h-6" />
                  Scanner QR Code
                </CardTitle>
                <CardDescription>
                  Escaneie o QR Code do seu objeto para registrar a localização atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {isScanning ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600">Escaneando...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600">Clique para escanear</p>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleScanQR}
                  disabled={isScanning}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Escaneando...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 mr-2" />
                      Iniciar Scanner
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  <p>• Permita acesso à câmera quando solicitado</p>
                  <p>• Posicione o QR Code dentro do quadro</p>
                  <p>• A localização será registrada automaticamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mapa */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Mapa de Localizações
                </CardTitle>
                <CardDescription>
                  Visualize as últimas localizações dos seus objetos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Mapa Interativo
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Em uma implementação completa, aqui seria exibido um mapa interativo 
                      mostrando as localizações de todos os objetos rastreados.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold">Objetos com Localização:</h4>
                  {objects.filter(obj => obj.lastLocation).map((object) => (
                    <div key={object.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{object.name}</p>
                        <p className="text-sm text-gray-600">{object.lastLocation?.address}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Histórico de Localizações</DialogTitle>
                <DialogDescription>
                  {selectedObject.name} - {selectedObject.qrCode}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedObject.locationHistory.length > 0 ? (
                  selectedObject.locationHistory.map((location, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{location.address}</p>
                        <p className="text-sm text-gray-600">
                          {location.timestamp.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                        </p>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          Atual
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhuma localização registrada ainda</p>
                    <p className="text-sm text-gray-500">Escaneie o QR Code para registrar a primeira localização</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de QR Code - MELHORADO E MAIS VISÍVEL */}
        {selectedObjectForQR && (
          <Dialog open={!!selectedObjectForQR} onOpenChange={() => setSelectedObjectForQR(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <QrCode className="w-7 h-7 text-purple-600" />
                  🎯 QR Code Gerado com Sucesso!
                </DialogTitle>
                <DialogDescription className="text-base">
                  <strong>{selectedObjectForQR.name}</strong> - Código: {selectedObjectForQR.qrCode}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {qrCodeDataUrl && (
                  <div className="text-center">
                    <div className="bg-white p-6 rounded-xl border-4 border-purple-200 inline-block shadow-lg">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code" 
                        className="w-72 h-72 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-4 font-medium">
                      ✅ QR Code pronto para impressão e uso!
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    onClick={downloadQRCode}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg py-6"
                    size="lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    📥 Baixar PNG
                  </Button>
                  <Button 
                    onClick={printQRCode}
                    variant="outline"
                    className="flex-1 text-lg py-6 border-2"
                    size="lg"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    🖨️ Imprimir
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3 text-lg">📋 Como usar seu QR Code:</h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">1.</span>
                      <span>Baixe ou imprima o QR Code em papel resistente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">2.</span>
                      <span>Cole ou fixe no objeto que deseja rastrear</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">3.</span>
                      <span>Use a aba "Escanear QR" para registrar localizações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">4.</span>
                      <span>Escaneie diariamente para acompanhar seu objeto!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}