import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Spinner } from "../spinner";

interface TableStatusCotProps {
    dateIni: string | null;
    dateFin: string | null;
}

export const TableStatusCot: React.FC<TableStatusCotProps> = ({
    dateIni,
    dateFin,
}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dateIni && dateFin) {
            setLoading(true);
            const consulta = `
               SELECT 
                    FORMAT(CONVERT(DATE, COTA.DATAAPROVACAO), 'dd/MM/yyyy') AS DIA_CONF_PEDIDO,
                    COUNT(CASE WHEN COTA.STATUS = 4 THEN 1 ELSE NULL END) AS QNT_COTADO,
                    COUNT(CASE WHEN COTA.STATUS = 2 THEN 1 ELSE NULL END) AS QNT_EM_COTACAO,
                    COUNT(CASE WHEN COTA.STATUS = 3 THEN 1 ELSE NULL END) AS QNT_PENDENTE_APRO,
                    COUNT(CASE WHEN COTA.STATUS IS NULL THEN 1 ELSE NULL END) AS QNT_VAZIO,
                    (
                        COUNT(CASE WHEN COTA.STATUS = 4 THEN 1 ELSE NULL END) +
                        COUNT(CASE WHEN COTA.STATUS = 2 THEN 1 ELSE NULL END) +
                        COUNT(CASE WHEN COTA.STATUS = 3 THEN 1 ELSE NULL END) +
                        COUNT(CASE WHEN COTA.STATUS IS NULL THEN 1 ELSE NULL END)
                    ) AS TOTAL
                FROM 
                    SANKHYA.AD_COTACAO COTA
                WHERE 
                    CONVERT(DATE, COTA.DATAAPROVACAO) BETWEEN '${dateIni}' AND '${dateFin}'
                    AND COTA.DATAAPROVACAO IS NOT NULL
                GROUP BY 
                    CONVERT(DATE, COTA.DATAAPROVACAO)
                ORDER BY 
                    DIA_CONF_PEDIDO;
            `;

            JX.consultar(consulta).then((response: any) => {
                setData(response);
            }).catch((err: any) => {
                console.error(err);
            }).finally(() => {
                setLoading(false)
            });
        }
    }, [dateIni, dateFin]);

    const totalCotado = data.reduce((acc, item) => acc + (item.QNT_COTADO || 0), 0);
    const totalEmCotacao = data.reduce((acc, item) => acc + (item.QNT_EM_COTACAO || 0), 0);
    const totalPendenteApro = data.reduce((acc, item) => acc + (item.QNT_PENDENTE_APRO || 0), 0);
    const totalVazio = data.reduce((acc, item) => acc + (item.QNT_VAZIO || 0), 0);
    const total = data.reduce((acc, item) => acc + (item.TOTAL || 0), 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>STATUS DAS COTAÇÕES</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center">
                        <Spinner />
                    </div>
                ) : (
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-h-60">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-2 py-2">Dt. Conf Pedido</th>
                                    <th scope="col" className="px-2 py-2">Cotado</th>
                                    <th scope="col" className="px-2 py-2">Em cotação</th>
                                    <th scope="col" className="px-2 py-2">Pendente de Aprovação</th>
                                    <th scope="col" className="px-2 py-2">Vazios</th>
                                    <th scope="col" className="px-2 py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((item, index) => (
                                        <tr key={index} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                {item.DIA_CONF_PEDIDO}
                                            </td>
                                            <td className="px-2 py-2">{item.QNT_COTADO}</td>
                                            <td className="px-2 py-2">{item.QNT_EM_COTACAO}</td>
                                            <td className="px-2 py-2">{item.QNT_PENDENTE_APRO}</td>
                                            <td className="px-2 py-2">{item.QNT_VAZIO}</td>
                                            <td className="px-2 py-2">{item.TOTAL}</td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                            Nenhum dado encontrado.
                                        </td>
                                    </tr>
                                )}
                                {data.length > 0 && (
                                    <tr className="bg-gray-100 font-bold">
                                        <td className="px-2 py-2 text-gray-900">Total</td>
                                        <td className="px-2 py-2">{totalCotado}</td>
                                        <td className="px-2 py-2">{totalEmCotacao}</td>
                                        <td className="px-2 py-2">{totalPendenteApro}</td>
                                        <td className="px-2 py-2">{totalVazio}</td>
                                        <td className="px-2 py-2">{total}</td>

                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
