import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.activity.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.cardAssignee.deleteMany()
  await prisma.card.deleteMany()
  await prisma.list.deleteMany()
  await prisma.board.deleteMany()
  await prisma.member.deleteMany()

  const [vidi, clara, rui] = await Promise.all([
    prisma.member.create({ data: { name: 'David Martins', initials: 'DM', hue: '#ff7a00' } }),
    prisma.member.create({ data: { name: 'Clara Nunes', initials: 'CN', hue: '#ffaa00' } }),
    prisma.member.create({ data: { name: 'Rui Pires', initials: 'RP', hue: '#f4e6c8' } }),
  ])

  const board = await prisma.board.create({
    data: {
      title: 'Redacção Cascais',
      titleEn: 'Cascais desk',
      description: 'Planeamento da edição de rua, desporto e fotojornalismo.',
      descriptionEn: 'Planning for street, sport and photojournalism editions.',
    },
  })

  const inbox = await prisma.list.create({
    data: { boardId: board.id, title: 'Entrada', titleEn: 'Inbox', sortOrder: 0 },
  })
  const shooting = await prisma.list.create({
    data: { boardId: board.id, title: 'A fotografar', titleEn: 'On assignment', sortOrder: 1 },
  })
  const edit = await prisma.list.create({
    data: { boardId: board.id, title: 'Edição', titleEn: 'Edit', sortOrder: 2 },
  })
  const done = await prisma.list.create({
    data: { boardId: board.id, title: 'Fechado', titleEn: 'Closed', sortOrder: 3 },
  })

  const cardA = await prisma.card.create({
    data: {
      listId: inbox.id,
      title: 'Mercado da Vila ao nascer do sol',
      titleEn: 'Village market at sunrise',
      description: 'Luz rasante, 35 mm, película Kodak.',
      descriptionEn: 'Raking light, 35 mm, Kodak film.',
      sortOrder: 0,
    },
  })
  const cardB = await prisma.card.create({
    data: {
      listId: shooting.id,
      title: 'Treino no Estádio',
      titleEn: 'Stadium training',
      description: '400 mm, desporto, foco no guarda-redes.',
      descriptionEn: '400 mm, sport, keeper in focus.',
      sortOrder: 0,
    },
  })
  await prisma.card.create({
    data: {
      listId: edit.id,
      title: 'Seleccionar contactos da noite',
      titleEn: 'Select night contacts',
      description: 'Marcar três frames para a capa.',
      descriptionEn: 'Mark three frames for the cover.',
      sortOrder: 0,
    },
  })
  await prisma.card.create({
    data: {
      listId: done.id,
      title: 'Entregar relatório da semana',
      titleEn: 'Deliver the weekly report',
      sortOrder: 0,
    },
  })

  await prisma.cardAssignee.createMany({
    data: [
      { cardId: cardA.id, memberId: vidi.id },
      { cardId: cardB.id, memberId: clara.id },
      { cardId: cardB.id, memberId: rui.id },
    ],
  })

  await prisma.comment.create({
    data: {
      cardId: cardB.id,
      memberId: clara.id,
      body: 'Levo o 70-200 se a luz cair.',
    },
  })

  await prisma.activity.createMany({
    data: [
      {
        boardId: board.id,
        cardId: cardA.id,
        kind: 'create',
        message: 'Cartão criado: Mercado da Vila ao nascer do sol',
        messageEn: 'Card created: Village market at sunrise',
      },
      {
        boardId: board.id,
        cardId: cardB.id,
        kind: 'assign',
        message: 'Clara Nunes atribuída a Treino no Estádio',
        messageEn: 'Clara Nunes assigned to Stadium training',
      },
    ],
  })

  const second = await prisma.board.create({
    data: {
      title: 'iVidi.dev sprints',
      titleEn: 'iVidi.dev sprints',
      description: 'Trabalho da marca e entregas a clientes.',
      descriptionEn: 'Brand work and client deliveries.',
    },
  })

  await prisma.list.createMany({
    data: [
      { boardId: second.id, title: 'Backlog', titleEn: 'Backlog', sortOrder: 0 },
      { boardId: second.id, title: 'Em curso', titleEn: 'In progress', sortOrder: 1 },
      { boardId: second.id, title: 'Revisão', titleEn: 'Review', sortOrder: 2 },
    ],
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
