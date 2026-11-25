import React, { useState } from 'react';
import { SchemaDefinition } from '../../types/cdp';
import { FileCode, Copy, CheckCircle2, X, Download } from 'lucide-react';

interface JsonSchemaViewerModalProps {
  schema: SchemaDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JsonSchemaViewerModal: React.FC<JsonSchemaViewerModalProps> = ({ schema, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !schema) return null;

  const buildXprXdmJsonSchema = (s: SchemaDefinition) => {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    s.fields.forEach(f => {
      if (f.isRequired) required.push(f.name);
      properties[f.name] = {
        title: f.name,
        description: f.description,
        type: f.dataType === 'timestamp' ? 'string' : f.dataType,
        format: f.dataType === 'timestamp' ? 'date-time' : undefined,
        'meta:xdmField': true,
        'meta:isIdentifier': f.isIdentifier,
        'meta:identifierType': f.identifierType,
        'meta:duleClassification': f.classification,
        'meta:isSensitive': f.isSensitive,
        'meta:maskInExports': f.maskInExports,
        'meta:blockInAdNetworks': f.blockInAdNetworks,
      };
    });

    return {
      $schema: 'http://json-schema.org/draft-06/schema#',
      $id: `https://ns.xprplatform.com/tenant/schemas/${s.id}`,
      title: s.name,
      version: s.version,
      category: s.category,
      type: 'object',
      description: s.description,
      'meta:baseClass': s.baseClass || 'https://ns.xprplatform.com/xdm/context/profile',
      'meta:tenantNamespace': s.tenantNamespace || '_tenant',
      'meta:status': s.status || 'Enabled for Profile',
      'meta:fieldGroups': s.fieldGroups || [],
      required: required.length > 0 ? required : undefined,
      properties
    };
  };

  const jsonContent = JSON.stringify(buildXprXdmJsonSchema(schema), null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.toLowerCase().replace(/\s+/g, '_')}_schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-md shadow-xl border border-[#E1E5EA] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-[#2C2C2C]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#F8F9FA] border-b border-[#E1E5EA] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#1473E6] text-white flex items-center justify-center shadow-2xs">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-[#2C2C2C] text-sm">{schema.name}</h3>
                <span className="text-[10px] bg-[#F2F4F7] text-[#4B4B4B] border border-[#E1E5EA] font-mono font-semibold px-1.5 py-0.2 rounded">
                  v{schema.version}
                </span>
              </div>
              <p className="text-[11px] text-[#6E6E6E] font-mono mt-0.5">
                {schema.baseClass || 'https://ns.xprplatform.com/xdm/context/profile'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#1473E6] text-xs font-medium rounded transition-colors border border-[#1473E6] shadow-2xs"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" /> : <Copy className="w-3.5 h-3.5 text-[#1473E6]" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#4B4B4B] text-xs font-medium rounded transition-colors border border-[#D5D5D5]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .json</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded bg-[#FFFFFF] hover:bg-[#F2F4F7] text-[#6E6E6E] border border-[#E1E5EA] flex items-center justify-center transition-colors text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#1E1E1E]">
          <pre className="text-xs font-mono text-[#A6E22E] leading-relaxed overflow-x-auto whitespace-pre">
            {jsonContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#F8F9FA] border-t border-[#E1E5EA] flex items-center justify-between text-xs text-[#6E6E6E]">
          <span>Compliant with XLR8 Platform Schema Registry APIs & IETF JSON-Schema Draft-06</span>
          <span className="font-mono text-[#4B4B4B] font-medium">{schema.fields.length} Fields Defined</span>
        </div>
      </div>
    </div>
  );
};
