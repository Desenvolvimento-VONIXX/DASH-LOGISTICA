"use client";

import { BarChart, Bar, XAxis, CartesianGrid, LabelList, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { Spinner } from "../spinner";

interface PedidosPorAgentesProps {
    dateIni: string | null;
    dateFin: string | null;
}

const chartConfig = {
    valor: {
        label: "Pedidos:",
        color: "hsl(var(--chart-1))",
    },
};

export const PedidosPorAgentes: React.FC<PedidosPorAgentesProps> = ({ dateIni, dateFin }) => {
    const [chartData, setChartData] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dateIni && dateFin) {
            setLoading(true);
            const consulta = `
                SELECT 
                    PAR.NOMEPARC AS AGENTE,
                    CAST(COALESCE(COUNT(CAB.NUNOTA), 0) AS VARCHAR) AS RESULTADO
                FROM 
                    SANKHYA.TGFCAB CAB
                LEFT JOIN 
                    AD_TGFLOGISTICAREG REG ON CAB.AD_PEDDESTINO = REG.CODIGO
                INNER JOIN 
                    AD_COTACAO ON AD_COTACAO.NUNOTA = CAB.NUNOTA
                INNER JOIN 
                    TGFPAR PAR ON CAB.CODPARCTRANSP = PAR.CODPARC
                WHERE 
                    CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
                    AND CAB.CODPARC NOT IN (266, 7259)
                    AND CAB.CODEMP = 1
                GROUP BY 
                    PAR.NOMEPARC

            `;

            JX.consultar(consulta).then((data: any) => {
                const formattedData = data.map((item: any) => ({
                    nome: item.AGENTE.trim(),
                    valor: item.RESULTADO,
                }));
                setChartData(formattedData);
            }).catch((err: any) => {
                console.error(err);
            }).finally(() => {
                setLoading(false)
            });
        }
    }, [dateIni, dateFin]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>PEDIDOS POR AGENTE</CardTitle>
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
                            margin={{ top: 20, bottom: 20 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="nome"
                                scale="auto"
                                tickLine={false}
                                tickMargin={2}
                                axisLine={false}
                                angle={-90}
                                textAnchor="end"
                                fontSize={8}
                                interval={0}
                            />

                            <Tooltip />

                            <Bar dataKey="valor" fill={chartConfig.valor.color} radius={8} height={20}>
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={10}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}

            </CardContent>

        </Card>
    );
};