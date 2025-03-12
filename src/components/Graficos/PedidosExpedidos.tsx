import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Spinner } from "../spinner";

const chartConfig = {
    value: {
        label: "Valor:",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;


interface PedidosExpedidosProps {
    dateIni: string | null;
    dateFin: string | null;
}

export const PedidosExpedidos: React.FC<PedidosExpedidosProps> = ({
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
                'VALOR' AS TIPO,
                COALESCE(SUM(CAB.VLRNOTA), 0) AS RESULTADO
            FROM SANKHYA.TGFCAB CAB
            LEFT JOIN AD_TGFLOGISTICAREG REG ON CAB.AD_PEDDESTINO = REG.CODIGO
            INNER JOIN AD_COTACAO ON AD_COTACAO.NUNOTA = CAB.NUNOTA
            WHERE 
                CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
                AND CAB.CODPARC NOT IN (266, 7259)
                AND CAB.CODEMP = 1
                AND REG.HORARIOEXEC IS NOT NULL

            UNION ALL

            SELECT 
                'PEDIDO' AS TIPO,
                COALESCE(COUNT(CAB.NUNOTA),0) AS RESULTADO
            FROM SANKHYA.TGFCAB CAB
            LEFT JOIN AD_TGFLOGISTICAREG REG ON CAB.AD_PEDDESTINO = REG.CODIGO
            INNER JOIN AD_COTACAO ON AD_COTACAO.NUNOTA = CAB.NUNOTA
            WHERE 
                CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
                AND CAB.CODPARC NOT IN (266, 7259)
                AND CAB.CODEMP = 1
                AND REG.HORARIOEXEC IS NOT NULL

            UNION ALL

            SELECT 
                'PESO_BRUTO' AS TIPO,
                COALESCE(SUM(CAB.PESOBRUTO),0) AS RESULTADO
            FROM SANKHYA.TGFCAB CAB
            LEFT JOIN AD_TGFLOGISTICAREG REG ON CAB.AD_PEDDESTINO = REG.CODIGO
            INNER JOIN AD_COTACAO ON AD_COTACAO.NUNOTA = CAB.NUNOTA
            WHERE 
                CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
                AND CAB.CODPARC NOT IN (266, 7259)
                AND CAB.CODEMP = 1
                AND REG.HORARIOEXEC IS NOT NULL

            UNION ALL 

            SELECT 
                'VOLUME' AS TIPO,
                COALESCE(SUM(TGFITE.QTDNEG / NULLIF(TGFPRO.QTDEMB, 0)), 0) AS RESULTADO
            FROM SANKHYA.TGFCAB CAB
            INNER JOIN SANKHYA.TGFITE TGFITE ON CAB.NUNOTA = TGFITE.NUNOTA
            INNER JOIN SANKHYA.TGFPRO TGFPRO ON TGFITE.CODPROD = TGFPRO.CODPROD
            LEFT JOIN AD_TGFLOGISTICAREG REG ON CAB.AD_PEDDESTINO = REG.CODIGO
            INNER JOIN AD_COTACAO ON AD_COTACAO.NUNOTA = CAB.NUNOTA
            WHERE 
                CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
                AND CAB.CODPARC NOT IN (266, 7259)
                AND CAB.CODEMP = 1
                AND REG.HORARIOEXEC IS NOT NULL

            ORDER BY RESULTADO DESC;


    
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
            opcao: item.TIPO === "PEDIDO" ? "Pedidos" :
                item.TIPO === "VALOR" ? "Valor NF" :
                    item.TIPO === "VOLUME" ? "Volume" :
                        item.TIPO === "PESO_BRUTO" ? "Peso Bruto" : item.TIPO,

            value: parseFloat(item.RESULTADO)
        }))
        .sort((a: any, b: any) => b.value - a.value);

    return (
        <Card>
            <CardHeader>
                <CardTitle>PEDIDOS EXPEDIDOS</CardTitle>
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
                            margin={{ top: 10, right: 100, left: 10, bottom: 10 }}
                        >
                            <XAxis type="number" dataKey="value" hide />
                            <YAxis
                                dataKey="opcao"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 10)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="value"
                                fill="var(--color-value)"
                                radius={5}
                                minPointSize={1}
                            >
                                <LabelList
                                    dataKey="value"
                                    position="right"
                                    dx={1}
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
