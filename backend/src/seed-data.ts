import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BlogService } from './blog/blog.service';
import { TestimonialsService } from './testimonials/testimonials.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const blogService = app.get(BlogService);
  const testimonialsService = app.get(TestimonialsService);

  console.log('🌱 Seeding data...');

  // 1. Seed Testimonials (5)
  const testimonials = [
    {
      name: 'Jean Dupont',
      role: 'Client Fidèle',
      content: 'Service exceptionnel ! Ma trottinette a été réparée en un temps record. L\'équipe est très professionnelle et accueillante. Je recommande vivement Mol Trottinette pour tout entretien.',
      initial: 'JD',
      tag: 'Réparation',
      date: 'Il y a 2 jours',
      active: true,
    },
    {
      name: 'Marie Martin',
      role: 'Utilisatrice Quotidienne',
      content: 'J\'ai acheté ma trottinette ici et je ne regrette pas. Les conseils étaient avisés et le SAV est top. C\'est rassurant de savoir qu\'on peut compter sur des experts en ville.',
      initial: 'MM',
      tag: 'Achat',
      date: 'Il y a 1 semaine',
      active: true,
    },
    {
      name: 'Pierre Durand',
      role: 'Passionné de Mobilité',
      content: 'Le meilleur rapport qualité-prix de la région. Les techniciens connaissent parfaitement leur métier. Ma batterie tient beaucoup mieux après leur intervention d\'optimisation.',
      initial: 'PD',
      tag: 'Entretien',
      date: 'Il y a 3 jours',
      active: true,
    },
    {
      name: 'Sophie Lefebvre',
      role: 'Navetteuse Urbaine',
      content: 'Réparation express suite à une crevaison. J\'ai pu repartir travailler en moins de 30 minutes. Un service indispensable pour ceux qui dépendent de leur trottinette.',
      initial: 'SL',
      tag: 'Urgence',
      date: 'Il y a 5 jours',
      active: true,
    },
    {
      name: 'Lucas Morel',
      role: 'Nouveau Client',
      content: 'Excellent accueil. On prend le temps de vous expliquer les différentes options sans vous pousser à la consommation. Je reviendrai sans hésiter pour mes futures révisions.',
      initial: 'LM',
      tag: 'Conseil',
      date: 'Hier',
      active: true,
    },
  ];

  for (const t of testimonials) {
    try {
      await testimonialsService.create(t);
      console.log(`✅ Testimonial for ${t.name} created.`);
    } catch (e) {
      console.error(`❌ Failed to create testimonial for ${t.name}:`, e.message);
    }
  }

  // 2. Seed Blog Posts (8)
  const blogs = [
    {
      title: 'Guide d\'entretien pour votre trottinette électrique',
      category: 'Entretien',
      content: 'Maintenir votre trottinette électrique en bon état est essentiel pour votre sécurité et la longévité de l\'appareil. Dans ce guide, nous abordons le serrage des vis, la pression des pneus et le nettoyage approprié sans endommager les composants électroniques...',
      excerpt: 'Apprenez les gestes simples pour prolonger la durée de vie de votre trottinette.',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
      status: 'Published',
      author: 'Expert Mol',
      tags: ['entretien', 'sécurité', 'guide'],
      publishDate: new Date().toISOString().split('T')[0],
    },
    {
      title: 'Les 5 meilleures trottinettes pour la ville en 2024',
      category: 'Nouveautés',
      content: 'Le marché de la mobilité urbaine évolue rapidement. Nous avons testé et sélectionné les 5 modèles les plus performants pour vos trajets quotidiens cette année, en nous basant sur l\'autonomie, le poids et le confort de conduite...',
      excerpt: 'Découvrez notre sélection des meilleurs modèles pour affronter la jungle urbaine.',
      imageUrl: 'https://images.unsplash.com/photo-1606508838041-2c64d606762a?auto=format&fit=crop&q=80&w=800',
      status: 'Published',
      author: 'Redac Mol',
      tags: ['2024', 'comparatif', 'urbain'],
      publishDate: new Date().toISOString().split('T')[0],
    },
    {
      title: 'Comment optimiser l\'autonomie de votre batterie',
      category: 'Conseils',
      content: 'L\'autonomie est souvent la préoccupation principale des utilisateurs. Saviez-vous que votre style de conduite, la température extérieure et même la pression de vos pneus influencent directement la distance que vous pouvez parcourir ? Voici nos astuces...',
      excerpt: 'Ne tombez plus jamais en panne sèche grâce à nos conseils de pro.',
      imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800',
      status: 'Published',
      author: 'Expert Mol',
      tags: ['batterie', 'autonomie', 'astuces'],
      publishDate: new Date().toISOString().split('T')[0],
    },
    {
      title: 'Sécurité routière : les règles à connaître',
      category: 'Sécurité',
      content: 'Circuler en trottinette électrique est soumis à une réglementation précise. Éclairage obligatoire, interdiction de rouler sur les trottoirs, port du casque recommandé... On fait le point sur ce que dit la loi pour rouler en toute sérénité...',
      excerpt: 'Roulez en toute légalité et protégez-vous ainsi que les autres usagers.',
      imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800',
      status: 'Published',
      author: 'Sécurité Mol',
      tags: ['loi', 'sécurité', 'prévention'],
      publishDate: new Date().toISOString().split('T')[0],
    },
    {
      title: 'Pourquoi choisir une trottinette électrique ?',
      category: 'Lifestyle',
      content: 'Économique, écologique et rapide, la trottinette électrique transforme nos villes. Au-delà de l\'aspect pratique, c\'est un nouveau mode de vie qui s\'offre à vous, libéré des contraintes des embouteillages et des transports en commun bondés...',
      excerpt: 'Les avantages insoupçonnés de passer à la mobilité électrique individuelle.',
      imageUrl: 'https://images.unsplash.com/photo-1597405219163-1490924040a3?auto=format&fit=crop&q=80&w=800',
      status: 'Published',
      author: 'Redac Mol',
      tags: ['lifestyle', 'écologie', 'mobilité'],
      publishDate: new Date().toISOString().split('T')[0],
    },
    {
      title: 'Test : La nouvelle Mol Trottinette Pro',
      category: 'Tests',
      content: 'Nous avons eu l\'exclusivité de tester le nouveau fleuron de notre gamme. Puissance moteur, suspension renforcée et nouveau système de freinage : est-elle à la hauteur de ses promesses ? Découvrez notre verdict complet après une semaine d\'utilisation intensive...',
      excerpt: 'Performances, confort et design : tout ce qu\'il faut savoir sur la Mol Pro.',
      imageUrl: 'https://images.unsplash.com/photo-1565193998946-24707605e74c?auto=format&fit=crop&q=80&w=800',
      status: 'Published',
      author: 'Expert Mol',
      tags: ['test', 'mol pro', 'exclu'],
      publishDate: new Date().toISOString().split('T')[0],
    },
    {
      title: 'Les accessoires indispensables pour cet hiver',
      category: 'Accessoires',
      content: 'Rouler en hiver demande un équipement spécifique. Des gants chauffants aux pneus spéciaux pour sol mouillé, en passant par l\'éclairage haute visibilité, voici notre sélection pour braver le froid et l\'humidité en toute sécurité...',
      excerpt: 'Équipez-vous correctement pour continuer à rouler malgré la météo.',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
      status: 'Published',
      author: 'Expert Mol',
      tags: ['hiver', 'accessoires', 'visibilité'],
      publishDate: new Date().toISOString().split('T')[0],
    },
    {
      title: 'Histoire de la mobilité urbaine',
      category: 'Culture',
      content: 'De la draisienne aux engins électriques modernes, comment l\'homme a-t-il révolutionné ses déplacements en ville ? Un voyage fascinant à travers le temps pour comprendre d\'où vient notre passion pour la mobilité légère et ce que nous réserve l\'avenir...',
      excerpt: 'Une rétrospective sur l\'évolution de nos moyens de transport urbains.',
      imageUrl: 'https://images.unsplash.com/photo-1522071823991-b5ae7264040d?auto=format&fit=crop&q=80&w=800',
      status: 'Published',
      author: 'Culture Mol',
      tags: ['histoire', 'culture', 'mobilité'],
      publishDate: new Date().toISOString().split('T')[0],
    },
  ];

  for (const b of blogs) {
    try {
      await blogService.create(b);
      console.log(`✅ Blog "${b.title}" created.`);
    } catch (e) {
      console.error(`❌ Failed to create blog "${b.title}":`, e.message);
    }
  }

  console.log('✨ Seeding completed!');
  await app.close();
}

bootstrap();
