"use client";

import { BarChart, Bar, XAxis, CartesianGrid, LabelList, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { Spinner } from "../spinner";

interface SkusPorSeparadorProps {
    dateIni: string | null;
    dateFin: string | null;
}

const chartConfig = {
    valor: {
        label: "SKUs:",
        color: "hsl(var(--chart-1))",
    },
};

export const SkusPorSeparador: React.FC<SkusPorSeparadorProps> = ({ dateIni, dateFin }) => {
    const [chartData, setChartData] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dateIni && dateFin) {
            setLoading(true);

            const consulta = `
                SELECT 
                TSIUSU.CODUSU,
                TSIUSU.NOMEUSU,
                COUNT(TGWITE.NUSEPARACAO) AS SKUS
                FROM TGWSEP SEP
                INNER JOIN TGWSXN ON TGWSXN.NUSEPARACAO = SEP.NUSEPARACAO
                INNER JOIN TGFCAB ON TGWSXN.NUNOTA = TGFCAB.AD_PEDDESTINO
                INNER JOIN AD_COTACAO ON AD_COTACAO.NUNOTA = TGFCAB.NUNOTA
                INNER JOIN TGWITE ON SEP.NUSEPARACAO = TGWITE.NUSEPARACAO
                INNER JOIN TSIUSU ON TSIUSU.CODUSU = (SELECT TOP 1 TSIUSU.CODUSU 
                    FROM SANKHYA.TGWITT, SANKHYA.TSIUSU
                    WHERE SEP.NUTAREFA = TGWITT.NUTAREFA
                    AND TGWITT.CODUSUEXEC = TSIUSU.CODUSU
                    AND CODUSUEXEC IS NOT NULL) 
                WHERE 
                CONVERT(DATE, AD_COTACAO.DH_COTADO) BETWEEN '${dateIni}' AND '${dateFin}'
                AND SEP.SITUACAO = 6
                GROUP BY 
                TSIUSU.CODUSU, TSIUSU.NOMEUSU
                ORDER BY SKUS DESC;
            `;

            JX.consultar(consulta).then((data: any) => {
                const formattedData = data.map((item: any) => ({
                    nome: item.NOMEUSU.trim(),
                    valor: item.SKUS,
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
                <CardTitle>SKUS POR SEPARADOR</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center">
                        <Spinner />
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-52">
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ top: 20, bottom: 25 }}
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

                            <Bar dataKey="valor" fill={chartConfig.valor.color} radius={8}>
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