import { useState } from "react";
import { clientApi } from "@/api/clientApi";
import { attentionHistoryApi } from "@/api/attentionHistoryApi";
import { clientDocumentApi } from "@/api/clientDocumentApi";
import { clientTimelineApi } from "@/api/clientTimelineApi";
import moment from "moment";
import { User, Calendar, Phone, MapPin, Activity, FileText, Clock, CheckCircle2, AlertCircle, Search, ChevronDown, ChevronUp, Stethoscope } from "lucide-react";

const estadoColors = {
  activo: "bg-green-100 text-green-800",
  pendiente: "bg-yellow-100 text-yellow-800",
  finalizado: "bg-blue-100 text-blue-800",
  no_continuo: "bg-red-100 text-red-800",
};

export default function PatientPortal() {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patient, setPatient] = useState(null);
  const [histories, setHistories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [expandedHistory, setExpandedHistory] = useState(null);

  const handleSearch = async () => {
    if (!dni.trim()) { setError("Por favor ingresa tu DNI"); return; }
    setLoading(true); setError(""); setPatient(null);
    try {
      const clients = await clientApi.filter({ documento: dni.trim() });
      if (!clients || clients.length === 0) {
        setError("No se encontró ningún paciente con ese DNI. Verifica el número e intenta nuevamente.");
        setLoading(false); return;
      }
      const found = clients[0];
      setPatient(found);
      const [hist, docs] = await Promise.all([
        attentionHistoryApi.filter({ client_id: found.id }),
        clientDocumentApi.filter({ client_id: found.id }),
      ]);
      setHistories(hist || []);
      setDocuments(docs || []);
    } catch (e) {
      setError("Error al buscar tu información. Intenta nuevamente.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Portal del Paciente</h1>
            <p className="text-sm text-gray-500">Consulta tu historial clínico</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {!patient ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Consulta tu historial</h2>
            <p className="text-gray-500 mb-8 text-center max-w-md">Ingresa tu DNI para ver tu información clínica y próximas citas.</p>
            <div className="w-full max-w-sm flex gap-2">
              <input
                placeholder="Ingresa tu DNI"
                value={dni}
                onChange={e => setDni(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={12}
              />
              <button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50">
                {loading ? <Clock className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg max-w-sm w-full">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <button onClick={() => { setPatient(null); setDni(""); }} className="text-blue-600 hover:text-blue-800 text-sm">← Buscar otro paciente</button>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-900">{patient.nombre} {patient.apellido}</h2>
                    {patient.estado && <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColors[patient.estado] || "bg-gray-100 text-gray-700"}`}>{patient.estado.replace("_"," ").toUpperCase()}</span>}
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    {patient.documento && <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> DNI: {patient.documento}</div>}
                    {patient.telefono && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {patient.telefono}</div>}
                    {patient.sede && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {patient.sede}</div>}
                    {patient.servicio_realizado && <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-gray-400" /> {patient.servicio_realizado}</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wide">Última atención</p><p className="text-lg font-bold text-gray-800">{patient.fecha_atencion ? moment(patient.fecha_atencion).format("DD/MM/YYYY") : "—"}</p></div>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6 text-blue-600" /></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Próxima sesión</p>
                  <p className="text-lg font-bold text-gray-800">{patient.fecha_proxima_sesion ? moment(patient.fecha_proxima_sesion).format("DD/MM/YYYY") : "Por confirmar"}</p>
                  {patient.fecha_proxima_sesion && <p className="text-xs text-blue-600">{moment(patient.fecha_proxima_sesion).fromNow()}</p>}
                </div>
              </div>
            </div>

            {histories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" />Historial de Atenciones ({histories.length})</h3>
                <div className="space-y-3">
                  {histories.map((h, i) => (
                    <div key={h.id || i} className="border rounded-xl overflow-hidden">
                      <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50" onClick={() => setExpandedHistory(expandedHistory === i ? null : i)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">{i+1}</div>
                          <div><p className="font-medium">{h.tipo_atencion || "Atención"}</p><p className="text-sm text-gray-500">{h.fecha ? moment(h.fecha).format("DD/MM/YYYY") : "Sin fecha"}</p></div>
                        </div>
                        {expandedHistory === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      {expandedHistory === i && (
                        <div className="px-4 pb-4 border-t bg-gray-50 pt-3 space-y-2">
                          {h.descripcion && <p className="text-sm text-gray-700"><span className="font-medium">Descripción:</span> {h.descripcion}</p>}
                          {h.profesional && <p className="text-sm text-gray-700"><span className="font-medium">Profesional:</span> {h.profesional}</p>}
                          {h.notas && <p className="text-sm text-gray-700"><span className="font-medium">Notas:</span> {h.notas}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" />Documentos ({documents.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {documents.map((doc, i) => (
                    <a key={doc.id || i} href={doc.url || doc.archivo} target="_blank" rel="noopener noreferrer" className="border rounded-xl p-3 hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center gap-2 text-center">
                      <FileText className="w-8 h-8 text-blue-400" />
                      <p className="text-xs text-gray-700 line-clamp-2">{doc.nombre || doc.titulo || `Documento ${i+1}`}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {histories.length === 0 && documents.length === 0 && (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aún no hay registros clínicos disponibles.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}