# Site da Panificadora Ki-pão

Site estático (HTML, CSS e JavaScript puro, sem build) pronto para a Vercel.

```
index.html        página única
css/style.css     visual
js/main.js        status aberto/fechado, menu do celular e encomenda com hora marcada
img/              fotos da galeria da Ki-pão no Google Maps, já otimizadas
vercel.json       URLs limpas e cache das imagens
robots.txt, sitemap.xml, favicon.svg, apple-touch-icon.png
```

## Publicar (GitHub + Vercel)

1. Em github.com, clique em **New repository**, nome `panificadora-kipao`, e crie.
2. Na tela do repositório vazio, clique em **uploading an existing file**.
3. Arraste para a página **o conteúdo** desta pasta (index.html, css, js, img e os outros arquivos), não a pasta inteira. Clique em **Commit changes**.
4. Em vercel.com, entre com a conta do GitHub, clique em **Add New > Project** e importe `panificadora-kipao`.
5. Em Framework Preset deixe **Other**, não mexa em mais nada e clique em **Deploy**.
6. O site fica em `https://panificadora-kipao.vercel.app`. Cada novo commit no GitHub atualiza o site sozinho.

## Se o endereço final for outro

O endereço `panificadora-kipao.vercel.app` está escrito em: `index.html` (canonical, og:url, og:image e o bloco JSON-LD), `robots.txt` e `sitemap.xml`. Troque em todos se o nome na Vercel ou o domínio próprio for diferente.

## Ajustes rápidos

Tudo fica no topo de `js/main.js`:

- `CONFIG.horarios`: horário de cada dia, em minutos (360 = 6h, 1170 = 19h30).
- `CONFIG.retirada`: primeiro horário de retirada, intervalo e folga antes de fechar.
- `OCASIOES`: itens, quantidade por pessoa, pedido mínimo e antecedência de cada tipo de encomenda.

Os horários da tabela e do rodapé estão escritos no `index.html` e precisam ser trocados junto.
