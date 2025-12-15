"use client";

import React, { useState } from 'react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';

interface CsvRow {
  CLIENTE: string;
  NOME: string;
  QUANTIDADE?: string; 
}

export default function HomePage() {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Por favor, selecione um arquivo .csv');
        return;
      }
      
      setFileName(file.name);
      setError('');

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: ";", 
        complete: (results: any) => {
          const fileColumns = results.meta.fields || [];
          if (!fileColumns.includes('CLIENTE') || !fileColumns.includes('NOME')) {
            setError('O arquivo CSV deve conter as colunas: CLIENTE e NOME');
            setCsvData([]);
            return;
          }

          setCsvData(results.data);
        },
        error: (err: any) => {
          setError(`Erro ao ler o arquivo: ${err.message}`);
        }
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent = "\uFEFFCLIENTE;NOME;QUANTIDADE\n" +
                       "Empresa ABC;João da Silva;1\n" + 
                       "Tech Solutions;Maria Oliveira;1";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_identificacao.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const generatePDF = () => {
    if (csvData.length === 0) {
      setError("Nenhum dado para gerar.");
      return;
    }
    setLoading(true);
    setError('');

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [100, 70], 
    });

    let labelsToPrint: CsvRow[] = [];
    csvData.forEach(row => {
        const qty = parseInt(row.QUANTIDADE || '1', 10);
        if (row.NOME || row.CLIENTE) {
            for (let i = 0; i < qty; i++) {
                labelsToPrint.push(row);
            }
        }
    });

    const drawLabelBlock = (row: CsvRow, yOffset: number) => {
        const width = 100;
        const centerX = width / 2;

        // --- CLIENTE ---
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8); 
        // Título à ESQUERDA (X=5)
        doc.text("CLIENTE:", 5, yOffset + 6); 

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11); 
        doc.setTextColor(0); 
        const clienteLines = doc.splitTextToSize((row.CLIENTE || "").toUpperCase(), width - 10);
        // Valor CENTRALIZADO
        doc.text(clienteLines, centerX, yOffset + 11, { align: 'center' });

        // --- NOME ---
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        // Título à ESQUERDA (X=5)
        doc.text("NOME:", 5, yOffset + 22);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16); 
        doc.setTextColor(0);
        
        const nomeText = (row.NOME || "").toUpperCase();
        const nomeLines = doc.splitTextToSize(nomeText, width - 10);
        
        // Valor CENTRALIZADO
        doc.text(nomeLines, centerX, yOffset + 28, { align: 'center' });
    };

    for (let i = 0; i < labelsToPrint.length; i += 2) {
        if (i > 0) doc.addPage();

        drawLabelBlock(labelsToPrint[i], 0);

        doc.setLineWidth(0.2);
        doc.setLineDashPattern([2, 2], 0); 
        doc.line(2, 35, 98, 35);
        doc.setLineDashPattern([], 0); 

        if (i + 1 < labelsToPrint.length) {
            drawLabelBlock(labelsToPrint[i + 1], 35);
        }
    }

    doc.save("etiquetas_duplas_100x70.pdf");
    setLoading(false);
  };
  
  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-700">
            <div className='text-center'>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Etiquetas de Identificação</h1>
                <p className="text-slate-400 mt-2 text-sm">Gera etiquetas 100x70mm com Nome e Cliente.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {error}
                </div>
            )}
            
            <div className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 border-dashed hover:border-emerald-500 transition-colors group">
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                        <svg className="w-10 h-10 text-slate-400 group-hover:text-emerald-400 mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white">
                            {fileName ? fileName : 'Clique para selecionar o CSV'}
                        </span>
                        <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <button 
                        onClick={downloadTemplate} 
                        className="flex items-center justify-center bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-4 rounded-lg transition-all text-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Modelo CSV
                    </button>

                    <button 
                        onClick={generatePDF} 
                        disabled={loading || csvData.length === 0} 
                        className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-emerald-900/20"
                    >
                        {loading ? 'Gerando...' : 'Gerar PDF'}
                    </button>
                </div>
            </div>
            
            <div className="text-center text-xs text-slate-500">
                <p>O arquivo deve ter as colunas: <strong>CLIENTE</strong> e <strong>NOME</strong></p>
            </div>
        </div>
    </div>
  );
}