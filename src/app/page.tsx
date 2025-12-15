"use client";

import React, { useState } from 'react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';

// --- ÁREA DE CONFIGURAÇÃO DO LOGO ---
// 1. Converta sua imagem (PNG ou JPG) para Base64 em um site como https://www.base64-image.de/
// 2. Cole a string GIGANTE gerada entre as aspas abaixo.
// OBS: Deixei um quadrado cinza genérico como exemplo.
const LOGO_BASE64 = "data:image/png;base64,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";

// Ajuste o tamanho do logo aqui (em milímetros)
const LOGO_WIDTH = 25;  // Largura
const LOGO_HEIGHT = 9; // Altura (tente manter a proporção original da imagem)
// ------------------------------------


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

        // --- LOGO (Canto Superior Direito) ---
        // A posição X é: Largura Total (100) - Largura Logo (12) - Margem Direita (5) = 83
        const logoX = width - LOGO_WIDTH - 5; 
        const logoY = yOffset + 1; // Margem superior de 5mm

        try {
            // Se seu logo for JPG, mude 'PNG' para 'JPEG' abaixo
            doc.addImage(LOGO_BASE64, 'PNG', logoX, logoY, LOGO_WIDTH, LOGO_HEIGHT);
        } catch (e) {
            console.error("Erro ao adicionar logo. Verifique a string Base64.", e);
        }


        // --- CLIENTE ---
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8); 
        
        // Título à ESQUERDA (X=5)
        doc.text("CLIENTE", 5, yOffset + 6); 

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11); 
        doc.setTextColor(0); 
        const clienteLines = doc.splitTextToSize((row.CLIENTE || "").toUpperCase(), width - 25); // Reduzi a largura útil para o texto não bater no logo
        // Valor CENTRALIZADO
        doc.text(clienteLines, centerX, yOffset + 11, { align: 'center' });

        // --- NOME ---
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        
        // Título à ESQUERDA (X=5)
        doc.text("NOME", 5, yOffset + 22);

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

    doc.save("etiquetas_duplas_com_logo.pdf");
    setLoading(false);
  };
  
  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 space-y-6 border border-slate-700">
            <div className='text-center'>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Etiquetas de Identificação</h1>
                <p className="text-slate-400 mt-2 text-sm">Gera etiquetas 100x70mm duplas com Logo.</p>
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
                <p className="mt-1">Logo configurado via código.</p>
            </div>
        </div>
    </div>
  );
}