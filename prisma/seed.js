const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("admin123", salt);

  await prisma.user.upsert({
    where: { email: "admin@hausjogja.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@hausjogja.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Main categories
  const menuHaus = await prisma.category.upsert({
    where: { slug: "menu-haus" },
    update: {},
    create: { name: "Menu Haus", slug: "menu-haus" },
  });

  const menuPanas = await prisma.category.upsert({
    where: { slug: "menu-haus-panas" },
    update: {},
    create: { name: "Menu Haus Panas", slug: "menu-haus-panas" },
  });

  const menuMakanan = await prisma.category.upsert({
    where: { slug: "menu-haus-makanan" },
    update: {},
    create: { name: "Menu Haus Makanan", slug: "menu-haus-makanan" },
  });

  // Subcategories
  const subcategories = {
    "menu-klasik": { name: "Menu Klasik", parentId: menuHaus.id },
    "menu-choco": { name: "Menu Choco", parentId: menuHaus.id },
    "menu-boba": { name: "Menu Boba", parentId: menuHaus.id },
    "menu-panas": { name: "Menu Panas", parentId: menuPanas.id },
    "roti-bakar": { name: "Roti Bakar", parentId: menuMakanan.id },
    "roti-maryam": { name: "Roti Maryam", parentId: menuMakanan.id },
    "menu-kukus": { name: "Menu Kukus", parentId: menuMakanan.id },
  };

  const createdSubcategories = {};

  for (const [slug, data] of Object.entries(subcategories)) {
    const sub = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { ...data, slug },
    });
    createdSubcategories[slug] = sub;
  }

  // Products (with dummy images named based on slug)
  const products = [
    // Menu Klasik
    {
      name: "Thai Tea Small",
      price: 6000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "Thai Tea Large",
      price: 9000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "Green Thai Tea Small",
      price: 8000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "Green Thai Tea Large",
      price: 10000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "Ovaltine Medium",
      price: 12000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "Ovaltine Large",
      price: 13000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "Taro Medium",
      price: 12000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "Taro Large",
      price: 13000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "Oreo Medium",
      price: 12000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "Oreo Large",
      price: 13000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "MILO Green Tea Medium",
      price: 12000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },
    {
      name: "MILO Green Tea Large",
      price: 13000,
      categoryId: createdSubcategories["menu-klasik"].id,
    },

    // Menu Choco
    {
      name: "Choco Lava MILO Medium",
      price: 13000,
      categoryId: createdSubcategories["menu-choco"].id,
    },
    {
      name: "Choco Lava MILO Large",
      price: 14000,
      categoryId: createdSubcategories["menu-choco"].id,
    },
    {
      name: "Choco Hazelnut Medium",
      price: 13000,
      categoryId: createdSubcategories["menu-choco"].id,
    },
    {
      name: "Choco Hazelnut Large",
      price: 14000,
      categoryId: createdSubcategories["menu-choco"].id,
    },
    {
      name: "Choco Avocado Medium",
      price: 14000,
      categoryId: createdSubcategories["menu-choco"].id,
    },
    {
      name: "Choco Avocado Large",
      price: 15000,
      categoryId: createdSubcategories["menu-choco"].id,
    },

    // Menu Boba
    {
      name: "Boba Brown Sugar Fresh Milk Medium",
      price: 14000,
      categoryId: createdSubcategories["menu-boba"].id,
    },
    {
      name: "Boba Brown Sugar Fresh Milk Large",
      price: 17000,
      categoryId: createdSubcategories["menu-boba"].id,
    },
    {
      name: "Boba Brown Sugar Milk Tea Medium",
      price: 14000,
      categoryId: createdSubcategories["menu-boba"].id,
    },
    {
      name: "Boba Brown Sugar Milk Tea Large",
      price: 17000,
      categoryId: createdSubcategories["menu-boba"].id,
    },

    // Menu Panas
    {
      name: "Hot Lemon Tea",
      price: 10000,
      categoryId: createdSubcategories["menu-panas"].id,
    },
    {
      name: "Hot Thai Tea",
      price: 11000,
      categoryId: createdSubcategories["menu-panas"].id,
    },
    {
      name: "Hot Coffee",
      price: 14000,
      categoryId: createdSubcategories["menu-panas"].id,
    },
    {
      name: "Hot Ovaltine",
      price: 14000,
      categoryId: createdSubcategories["menu-panas"].id,
    },
    {
      name: "Hot Choco Lava MILO",
      price: 14000,
      categoryId: createdSubcategories["menu-panas"].id,
    },

    // Roti Bakar
    {
      name: "Bakar Coklat",
      price: 24000,
      categoryId: createdSubcategories["roti-bakar"].id,
    },
    {
      name: "Bakar Keju",
      price: 25000,
      categoryId: createdSubcategories["roti-bakar"].id,
    },
    {
      name: "Bakar Coklat Keju",
      price: 27000,
      categoryId: createdSubcategories["roti-bakar"].id,
    },

    // Roti Maryam
    {
      name: "Maryam Coklat",
      price: 13000,
      categoryId: createdSubcategories["roti-maryam"].id,
    },
    {
      name: "Maryam Keju",
      price: 14000,
      categoryId: createdSubcategories["roti-maryam"].id,
    },
    {
      name: "Maryam Coklat Keju",
      price: 16000,
      categoryId: createdSubcategories["roti-maryam"].id,
    },

    // Kukus
    {
      name: "Kukus Coklat",
      price: 10000,
      categoryId: createdSubcategories["menu-kukus"].id,
    },
    {
      name: "Kukus Keju",
      price: 11000,
      categoryId: createdSubcategories["menu-kukus"].id,
    },
    {
      name: "Kukus Coklat Keju",
      price: 14000,
      categoryId: createdSubcategories["menu-kukus"].id,
    },
  ];

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/\s+/g, "-");
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        price: p.price,
        description: `Produk ${p.name}`,
        image: `${slug}.jpg`,
        categoryId: p.categoryId,
      },
    });
  }

  console.log("✅ Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
