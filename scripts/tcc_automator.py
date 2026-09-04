#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
DocuTCC - Script CLI de Automação de Documentação Acadêmica ABNT
=============================================================================
Este script automatiza a criação, validação de conformidade ABNT e exportação
de Trabalhos de Conclusão de Curso (TCC) diretamente via linha de comando.
Compatível com NBR 14724:2011, NBR 6023:2018, NBR 10520:2023 e NBR 6028:2021.

Uso:
    python tcc_automator.py --tema "Visão Computacional no Almoxarifado com YOLOv8" \
                           --curso "Ciência da Computação" \
                           --autor "Jhonatan Palmeira" \
                           --orientador "Prof. Dr. Carlos Mendes" \
                           --output "meu_tcc_abnt.json"
=============================================================================
"""

import sys
import json
import argparse
import urllib.request
import urllib.error
from datetime import datetime

DEFAULT_SERVER_URL = "http://localhost:3000"

def parse_arguments():
    parser = argparse.ArgumentParser(
        description="DocuTCC Automator - Geração e Validação de TCC com IA nas Normas ABNT"
    )
    parser.add_argument(
        "--tema",
        required=True,
        help="Tema ou título do Trabalho de Conclusão de Curso"
    )
    parser.add_argument(
        "--curso",
        default="Ciência da Computação",
        help="Curso de graduação ou pós-graduação"
    )
    parser.add_argument(
        "--grau",
        default="bacharelado",
        choices=["tecnico", "bacharelado", "licenciatura", "tecnologo", "especializacao", "mestrado", "doutorado"],
        help="Nível ou grau do curso (ex: 'tecnico' para nível médio técnico profissionalizante, 'tecnologo' para graduação tecnológica)"
    )
    parser.add_argument(
        "--tipo",
        default="monografia",
        choices=["tcc_tecnico", "monografia", "artigo", "relatorio_tecnico", "projeto_pesquisa"],
        help="Tipo de documento acadêmico ('tcc_tecnico', 'monografia', 'artigo', etc.)"
    )
    parser.add_argument(
        "--autor",
        default="Autor Acadêmico",
        help="Nome completo do autor"
    )
    parser.add_argument(
        "--orientador",
        default="Prof. Dr. Orientador Acadêmico",
        help="Nome e titulação do orientador"
    )
    parser.add_argument(
        "--instituicao",
        default="Universidade Federal / Instituto Superior",
        help="Nome da Instituição de Ensino Superior"
    )
    parser.add_argument(
        "--cidade",
        default="São Paulo",
        help="Cidade de entrega"
    )
    parser.add_argument(
        "--objetivos",
        default="Desenvolver e validar cientificamente o projeto com rigor metodológico.",
        help="Objetivos gerais e específicos resumidos"
    )
    parser.add_argument(
        "--tecnologias",
        default="Python, YOLOv8, OpenCV, Node.js",
        help="Tecnologias, metodologias ou instrumentos utilizados"
    )
    parser.add_argument(
        "--output",
        default="tcc_gerado_abnt.json",
        help="Caminho do arquivo JSON de backup/dados"
    )
    parser.add_argument(
        "--docx",
        default="",
        help="Caminho do arquivo Word (.docx ABNT) a ser gerado (padrão: tcc_gerado_abnt.docx)"
    )
    parser.add_argument(
        "--server",
        default=DEFAULT_SERVER_URL,
        help="URL base do servidor DocuTCC"
    )
    parser.add_argument(
        "--auditar",
        action="store_true",
        help="Executar auditoria ABNT automática imediatamente após a geração"
    )
    return parser.parse_args()


def generate_tcc(args):
    endpoint = f"{args.server}/api/gemini/generate-full-tcc"
    payload = {
        "topic": args.tema,
        "course": args.curso,
        "degree": args.grau,
        "documentType": args.tipo,
        "objectives": args.objetivos,
        "technologies": args.tecnologias,
        "authorName": args.autor,
        "advisorName": args.orientador,
        "institutionName": args.instituicao,
        "city": args.cidade,
        "year": str(datetime.now().year)
    }

    print("=" * 70)
    print("🚀 DocuTCC Automator - Iniciando Geração com IA")
    print("=" * 70)
    print(f"📖 Tema:         {args.tema}")
    print(f"🎓 Curso:        {args.curso} ({args.grau})")
    print(f"✍️  Autor:        {args.autor}")
    print(f"🏛️  Instituição:  {args.instituicao}")
    print(f"🌐 Servidor:     {endpoint}")
    print("⏳ Conectando ao motor neural e estruturando normas ABNT...")

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            project = res_data.get("project")
            if not project:
                print("❌ Erro: Nenhum projeto retornado pela API.")
                sys.exit(1)

            # 1. Exporta o documento Microsoft Word (.docx) formatado segundo as normas ABNT NBR 14724
            docx_output = args.docx if args.docx else (args.output.rsplit(".", 1)[0] + ".docx" if "." in args.output else args.output + ".docx")
            try:
                print(f"📄 Solicitando formatação ABNT em Microsoft Word (.docx)...")
                docx_req = urllib.request.Request(
                    f"{args.server}/api/export/docx",
                    data=json.dumps({"project": project}).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(docx_req, timeout=60) as docx_resp:
                    with open(docx_output, "wb") as docx_file:
                        docx_file.write(docx_resp.read())
                print(f"📄 Documento Word (.docx ABNT) gerado com sucesso!")
            except Exception as e_docx:
                print(f"⚠️ Não foi possível obter o arquivo Word (.docx) do backend: {e_docx}")

            # 2. Salva o arquivo de dados JSON para restauração técnica ou auditoria
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(project, f, indent=2, ensure_ascii=False)

            print("\n" + "=" * 70)
            print("🎉 DOCUMENTAÇÃO ACADÊMICA ABNT CONCLUÍDA COM SUCESSO!")
            print("=" * 70)
            print(f"📄 Documento Word pronto para abrir/entregar: {docx_output}")
            print(f"💾 Cópia técnica de backup/dados (.json):       {args.output}")
            print(f"📌 Título gerado:   {project.get('title')}")
            print(f"📑 Seções criadas:   {len(project.get('sections', []))}")
            print(f"📚 Referências:     {len(project.get('references', []))}")
            
            if args.auditar:
                audit_tcc(project, args.server)
                
            return project

    except urllib.error.HTTPError as e:
        print(f"❌ Erro HTTP ({e.code}): {e.read().decode('utf-8')}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"❌ Erro de conexão com o servidor: {e.reason}")
        print("💡 Verifique se o servidor DocuTCC está em execução.")
        sys.exit(1)


def audit_tcc(project, server_url):
    endpoint = f"{server_url}/api/gemini/audit-abnt"
    print("\n🔍 Executando Auditoria Automática ABNT...")
    req = urllib.request.Request(
        endpoint,
        data=json.dumps({"project": project}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            audit_res = json.loads(response.read().decode("utf-8"))
            audit = audit_res.get("audit", {})
            print("-" * 70)
            print(f"📊 Índice de Conformidade ABNT: {audit.get('score', 0)}/100")
            print(f"📝 Diagnóstico: {audit.get('summary', 'Sem resumo')}")
            print("-" * 70)
            for chk in audit.get("checklist", []):
                status_icon = "✅" if chk.get("status") == "pass" else "⚠️"
                print(f"{status_icon} {chk.get('name')}: {chk.get('details')}")
    except Exception as e:
        print(f"⚠️  Aviso: Não foi possível concluir a auditoria via API ({e})")


if __name__ == "__main__":
    args = parse_arguments()
    generate_tcc(args)
