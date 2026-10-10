create table if not exists products (
  slug text primary key,
  name text not null,
  category text not null,
  price_naira integer not null check (price_naira > 0),
  blurb text not null,
  description text not null,
  material text not null,
  origin text not null,
  tone text not null,
  motif text not null,
  featured boolean not null default false,
  stock integer not null check (stock >= 0)
);

create index if not exists products_category_idx on products (category);

create table if not exists orders (
  code text primary key,
  items jsonb not null,
  dispatch_naira integer not null check (dispatch_naira >= 0),
  total_naira integer not null check (total_naira >= 0),
  created_at timestamptz not null default now()
);

insert into products (
  slug, name, category, price_naira, blurb, description, material, origin, tone, motif, featured, stock
) values
  (
    'indigo-loom-throw',
    'Indigo Loom Throw',
    'Textiles',
    48000,
    'Heavy cotton in deep indigo, with a cream fringe that pools on the floor.',
    'Woven in a narrow width and seamed once down the centre so the cloth stays heavy. It is a throw first, and a picnic cloth when the weather turns. The indigo is dyed in the yarn, so the colour stays in the fold.',
    'Handwoven cotton',
    'Ibadan loom',
    'indigo',
    'weave',
    true,
    7
  ),
  (
    'abeokuta-clay-jug',
    'Abeokuta Clay Jug',
    'Ceramics',
    32500,
    'A tall water jug in matte clay, thrown to live on the table.',
    'The belly holds a litre and a little more. The lip is cut so water pours without a trail down the side. Leave it unglazed inside the handle, where the clay still shows the hand.',
    'Terracotta, matte',
    'Abeokuta clay studio',
    'clay',
    'vessel',
    true,
    5
  ),
  (
    'hammered-brass-bowl',
    'Hammered Brass Bowl',
    'Brass',
    27000,
    'A small hand-hammered bowl for salt, keys, or one piece of fruit.',
    'Raised from a single disc and planished until the marks settle into a tight field. It will darken where hands touch it. That is the finish, not a flaw.',
    'Hammered brass',
    'Lagos brass bench',
    'brass',
    'disc',
    false,
    9
  ),
  (
    'sand-indigo-runner',
    'Sand and Indigo Runner',
    'Textiles',
    36000,
    'A two-colour runner, long enough for a table of eight.',
    'Wide stripes of indigo and sand, woven tight so glasses sit steady. The ends are turned and stitched, not fringed, so it can be washed and put straight back.',
    'Cotton weave',
    'Ibadan loom',
    'indigo',
    'stripe',
    true,
    6
  ),
  (
    'speckle-dinner-plates',
    'Speckle Dinner Plates',
    'Ceramics',
    42000,
    'Four stoneware plates with a quiet rim and a warm oatmeal glaze.',
    'A set of four, same diameter, each with its own scatter of iron speckle. They stack clean and they are happy in a dishwasher. Dinner, not display.',
    'Speckled stoneware, set of four',
    'Ife stoneware kiln',
    'oat',
    'stack',
    false,
    8
  ),
  (
    'washed-linen-cloth',
    'Washed Linen Cloth',
    'Textiles',
    54000,
    'Washed linen for six, slubby and soft, the colour of raw flax.',
    'Pre-washed so the first dinner does not surprise you with shrinkage. The hem is wide and the corners are mitred. It wrinkles. That is the cloth doing its job.',
    'European flax, garment-washed',
    'Cut and sewn in Yaba',
    'oat',
    'fold',
    false,
    4
  ),
  (
    'smoked-cedar-candle',
    'Smoked Cedar Candle',
    'Scent',
    18500,
    'Soy wax in smoked glass. Cedar, a little smoke, about forty-five hours.',
    'Poured in a short tumbler you can keep when the wax is gone. The scent is cedarwood and a dry smoke, never sweet. Burn it on a plate the first time.',
    'Soy wax, smoked glass',
    'Poured in Lagos',
    'ink',
    'flame',
    true,
    14
  ),
  (
    'slender-brass-sticks',
    'Slender Brass Sticks',
    'Brass',
    31000,
    'A pair of slim sticks, one a little taller, for dinner after dark.',
    'Turned, not cast, so the stems stay light. They take a standard dinner candle. Sold as a pair because one stick always looks like it is waiting.',
    'Solid brass, pair',
    'Lagos brass bench',
    'brass',
    'pair',
    false,
    6
  ),
  (
    'palm-market-basket',
    'Palm Market Basket',
    'Textiles',
    22000,
    'A round coiled palm basket for bread, yarn, or the weekly market.',
    'Coil built from palm and a cotton wrap, tight enough to hold oranges. The handle is the same coil, continued. It likes a dry cupboard.',
    'Coiled palm and cotton',
    'Badagry coop',
    'oat',
    'coil',
    false,
    11
  ),
  (
    'oatmeal-mug-pair',
    'Oatmeal Mug Pair',
    'Ceramics',
    19500,
    'Two straight-sided mugs in an oatmeal glaze. Daily, not delicate.',
    'A generous cup, thick enough that coffee stays hot past the first page. The glaze breaks brown on the rim. Sold as a pair.',
    'Stoneware, pair',
    'Ife stoneware kiln',
    'oat',
    'cup',
    false,
    10
  ),
  (
    'clay-geometry-cushion',
    'Clay Geometry Cushion',
    'Textiles',
    28000,
    'A wool cushion cover in clay and cream blocks. Cover only.',
    'The face is a flat weave, the back is a plain cotton with a hidden zip. It fits a 45 centimetre pad, which is not included. The blocks are clay, sand, and cream.',
    'Wool face, cotton back',
    'Woven in Ibadan, sewn in Yaba',
    'clay',
    'block',
    false,
    5
  ),
  (
    'sand-oil-pourer',
    'Sand Oil Pourer',
    'Ceramics',
    16800,
    'A small cruet for oil, sand glaze, a short spout that pours clean.',
    'Holds about 200 millilitres. The spout is pulled, not attached, so there is no seam to drip from. Cork stopper included.',
    'Stoneware, cork stopper',
    'Abeokuta clay studio',
    'clay',
    'spout',
    false,
    9
  )
on conflict (slug) do nothing;
