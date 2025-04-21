const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hausjogja.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@hausjogja.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('Admin user created:', admin);

  // Seed main categories
  const hausCategory = await prisma.category.upsert({
    where: { name: 'Menu Haus' },
    update: {},
    create: {
      name: 'Menu Haus',
      slug: 'menu-haus'
    }
  });

  const hausPanasCategory = await prisma.category.upsert({
    where: { name: 'Menu Haus Panas' },
    update: {},
    create: {
      name: 'Menu Haus Panas',
      slug: 'menu-haus-panas'
    }
  });

  const hausMakananCategory = await prisma.category.upsert({
    where: { name: 'Menu Haus Makanan' },
    update: {},
    create: {
      name: 'Menu Haus Makanan',
      slug: 'menu-haus-makanan'
    }
  });

  // Seed subcategories for Menu Haus
  const menuKlasik = await prisma.category.upsert({
    where: { name: 'Menu Klasik' },
    update: {},
    create: {
      name: 'Menu Klasik',
      slug: 'menu-klasik',
      parentId: hausCategory.id
    }
  });

  const menuChoco = await prisma.category.upsert({
    where: { name: 'Menu Choco' },
    update: {},
    create: {
      name: 'Menu Choco',
      slug: 'menu-choco',
      parentId: hausCategory.id
    }
  });

  const menuBoba = await prisma.category.upsert({
    where: { name: 'Menu Boba' },
    update: {},
    create: {
      name: 'Menu Boba',
      slug: 'menu-boba',
      parentId: hausCategory.id
    }
  });

  // Seed subcategories for Menu Haus Makanan
  const rotiBakar = await prisma.category.upsert({
    where: { name: 'Roti Bakar' },
    update: {},
    create: {
      name: 'Roti Bakar',
      slug: 'roti-bakar',
      parentId: hausMakananCategory.id
    }
  });

  const rotiMaryam = await prisma.category.upsert({
    where: { name: 'Roti Maryam' },
    update: {},
    create: {
      name: 'Roti Maryam',
      slug: 'roti-maryam',
      parentId: hausMakananCategory.id
    }
  });

  const rotiKukus = await prisma.category.upsert({
    where: { name: 'Roti Kukus' },
    update: {},
    create: {
      name: 'Roti Kukus',
      slug: 'roti-kukus',
      parentId: hausMakananCategory.id
    }
  });

  // Seed sample products for each category
  const products = [
    // Menu Klasik
    {
      name: 'Es Teh',
      price: 8000,
      description: 'Teh manis segar dengan es.',
      categoryId: menuKlasik.id
    },
    {
      name: 'Es Jeruk',
      price: 10000,
      description: 'Jeruk segar dengan es.',
      categoryId: menuKlasik.id
    },
    // Menu Choco
    {
      name: 'Chocolate Milk',
      price: 15000,
      description: 'Susu cokelat dingin.',
      categoryId: menuChoco.id
    },
    {
      name: 'Choco Hazelnut',
      price: 18000,
      description: 'Cokelat hazelnut yang lezat.',
      categoryId: menuChoco.id
    },
    // Menu Boba
    {
      name: 'Boba Milk Tea',
      price: 16000,
      description: 'Teh susu dengan boba hitam.',
      categoryId: menuBoba.id
    },
    {
      name: 'Boba Chocolate',
      price: 18000,
      description: 'Cokelat dengan boba hitam.',
      categoryId: menuBoba.id
    },
    // Menu Haus Panas
    {
      name: 'Kopi Panas',
      price: 12000,
      description: 'Kopi hitam panas.',
      categoryId: hausPanasCategory.id
    },
    {
      name: 'Teh Panas',
      price: 8000,
      description: 'Teh manis panas.',
      categoryId: hausPanasCategory.id
    },
    // Roti Bakar
    {
      name: 'Roti Bakar Cokelat',
      price: 15000,
      description: 'Roti bakar dengan selai cokelat.',
      categoryId: rotiBakar.id
    },
    {
      name: 'Roti Bakar Keju',
      price: 15000,
      description: 'Roti bakar dengan keju.',
      categoryId: rotiBakar.id
    },
    // Roti Maryam
    {
      name: 'Roti Maryam Original',
      price: 12000,
      description: 'Roti maryam polos.',
      categoryId: rotiMaryam.id
    },
    {
      name: 'Roti Maryam Cokelat',
      price: 15000,
      description: 'Roti maryam dengan cokelat.',
      categoryId: rotiMaryam.id
    },
    // Roti Kukus
    {
      name: 'Roti Kukus Original',
      price: 10000,
      description: 'Roti kukus lembut.',
      categoryId: rotiKukus.id
    },
    {
      name: 'Roti Kukus Pandan',
      price: 12000,
      description: 'Roti kukus dengan rasa pandan.',
      categoryId: rotiKukus.id
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, '-'),
        price: product.price,
        description: product.description,
        categoryId: product.categoryId
      }
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
