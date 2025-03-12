import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,

} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Bar, BarChart, LabelList, Tooltip, XAxis, YAxis } from "recharts";
import { Spinner } from "../spinner";


const chartConfig = {
    value: {
        label: "Valor:",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

interface PesoPorAgenteProps {
    dateIni: string | null;
    dateFin: string | null;
}



export const PesoPorAgentes: React.FC<PesoPorAgenteProps> = ({
    dateIni,
    dateFin,
}) => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dateIni && dateFin) {
            setLoading(true);
            const consulta = `
            SELECT 
            PAR.NOMEPARC AS AGENTE,
            FORMAT(SUM(ISNULL(PRO.PESOBRUTO, 0) * ISNULL(ITT.QTDVOLPAD, 0)), 'N2') AS RESULTADO
            FROM TGWSEP SEP
            INNER JOIN TGWSXN ON TGWSXN.NUSEPARACAO = SEP.NUSEPARACAO
            INNER JOIN TGFCAB CAB ON TGWSXN.NUNOTA = CAB.AD_PEDDESTINO
            INNER JOIN TGWITT ITT ON SEP.NUTAREFA = ITT.NUTAREFA
            INNER JOIN TGFPRO PRO ON ITT.CODPROD = PRO.CODPROD
            INNER JOIN AD_COTACAO ON AD_COTACAO.NUNOTA = CAB.NUNOTA 
            INNER JOIN TGFPAR PAR ON CAB.CODPARCTRANSP = PAR.CODPARC
            LEFT JOIN  AD_TGFLOGISTICAREG REG ON CAB.AD_PEDDESTINO = REG.CODIGO
            WHERE 
            CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
            AND CAB.CODPARC NOT IN (266, 7259)
            AND CAB.CODEMP = 1
            GROUP BY PAR.NOMEPARC
            `;
            JX.consultar(consulta).then((data: any) => {
                setData(data);
            }).catch((err: any) => {
                console.error(err);
            }).finally(() => {
                setLoading(false)
            });
        }

    }, [dateIni, dateFin]);

    const chartData = data
        .map((item: any) => ({
            agente: item.AGENTE.trim(),
            value: parseFloat(item.RESULTADO)
        }))
        .sort((a: any, b: any) => b.value - a.value);

    return (
        <Card>
            <CardHeader>
                <CardTitle>PESO POR AGENTE</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center text-center h-full">
                        <Spinner />
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-52">
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 10, right: 50, bottom: 10 }}

                        >
                            <XAxis type="number" dataKey="value" hide />
                            <YAxis
                                dataKey="agente"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 8}}
                                tickFormatter={(value) => value.slice(0, 5)}

                            />

 
                            <Tooltip />
                            <Bar dataKey="value" fill={chartConfig.value.color} radius={5} minPointSize={1} className="mb-8">
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    style={{ fill: 'black', fontWeight: 'bold' }}
                                    formatter={(value: number) => {

                                        return new Intl.NumberFormat('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }).format(value);
                                    }}
                                />
                            </Bar>

                        </BarChart>
                    </ChartContainer>
                )}

            </CardContent>
        </Card>
    );
};
