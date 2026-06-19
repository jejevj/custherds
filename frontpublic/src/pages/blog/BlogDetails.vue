<template>
  <div>
    <Preloader />
    <ChatPopup />

    <div class="theme-border-left"></div>
    <div class="theme-border-right"></div>

    <SidebarWidget />

    <div class="page-wrapper">
      <HeaderTwo />

      <PageHeader 
        title="Blog Details"
        subtitle="Business Models you can Consider"
        :breadcrumbs="breadcrumbs"
      />

      <section class="blog-details">
        <div class="section-shape-1" :style="{ backgroundImage: 'url(' + sectionShape + ')' }"></div>
        <div class="container">
          <div class="row">
            <div class="col-xl-8 col-lg-7">
              <!-- Main Blog Content -->
              <BlogDetailsContent
                :image="blogPost.image"
                :title="blogPost.title"
                :author="blogPost.author"
                :comments="blogPost.comments"
                :content1="blogPost.content1"
                :content2="blogPost.content2"
                :tags="blogPost.tags"
              />

              <!-- Author Info -->
              <BlogDetailsAuthor
                :image="authorInfo.image"
                :name="authorInfo.name"
                :bio="authorInfo.bio"
                :socialLinks="authorInfo.socialLinks"
              />

              <!-- Previous/Next Navigation -->
              <BlogDetailsNavigation
                :prevPost="prevPost"
                :nextPost="nextPost"
              />

              <!-- Comments Section -->
              <BlogDetailsComments
                :comments="comments"
                @reply="handleReply"
              />

              <!-- Comment Form -->
              <BlogDetailsCommentForm
                @submit="handleCommentSubmit"
              />
            </div>

            <div class="col-xl-4 col-lg-5">
              <BlogSidebar
                :latestPosts="latestPosts"
                :categories="categories"
                :tags="sidebarTags"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
    </div>

    <MobileNav />
    <SearchPopup />
    <ScrollToTop />
  </div>
</template>

<script setup>
import Preloader from '@/components/common/Preloader.vue';
import ChatPopup from '@/components/common/ChatPopup.vue';
import SidebarWidget from '@/components/common/SidebarWidget.vue';
import MobileNav from '@/components/common/MobileNav.vue';
import SearchPopup from '@/components/common/SearchPopup.vue';
import ScrollToTop from '@/components/common/ScrollToTop.vue';
import HeaderTwo from '@/components/layout/header/HeaderTwo.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Footer1 from '@/components/layout/footer/Footer1.vue';
import BlogDetailsContent from '@/components/blog/BlogDetailsContent.vue';
import BlogDetailsAuthor from '@/components/blog/BlogDetailsAuthor.vue';
import BlogDetailsNavigation from '@/components/blog/BlogDetailsNavigation.vue';
import BlogDetailsComments from '@/components/blog/BlogDetailsComments.vue';
import BlogDetailsCommentForm from '@/components/blog/BlogDetailsCommentForm.vue';
import BlogSidebar from '@/components/blog/BlogSidebar.vue';

import sectionShape from '@/assets/images/shapes/blog-details-sec-shape-1.png';
import blogDetailsImg from '@/assets/images/blog/blog-details-img-1.jpg';
import authorImg from '@/assets/images/blog/blog-details-client-img.jpg';
import comment1 from '@/assets/images/blog/comment-1-1.jpg';
import comment2 from '@/assets/images/blog/comment-1-2.jpg';
import latestPost1 from '@/assets/images/blog/lp-1-1.jpg';
import latestPost2 from '@/assets/images/blog/lp-1-2.jpg';
import latestPost3 from '@/assets/images/blog/lp-1-3.jpg';

const breadcrumbs = [
    { label: 'Home', link: '/' },
    { label: 'Blog Details', link: '' }
];

const blogPost = {
    image: blogDetailsImg,
    title: 'Transforming challenges into opportunities with IT.',
    author: 'Admin',
    comments: 6,
    content1: 'Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam quis purus in justo pulvinar tempor. Aliquam tellus nulla, sollicitudin at euismod nec, feugiat at nisi. Quisque vitae odio nec lacus interdum tempus. Phasellus a rhoncus erat. Vivamus vel eros vitae',
    content2: 'Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam quis purus in justo pulvinar tempor. Aliquam tellus nulla, sollicitudin at euismod nec, feugiat at nisi. Quisque vitae odio nec lacus interdum tempus. Phasellus a rhoncus erat. Vivamus vel eros vitae est aliquet pellentesque vitae et nunc. Sed vitae leo vitae nisl pellentesque semper euismod justo',
    tags: ['Graphics', 'Cargo', 'Blog']
};

const authorInfo = {
    image: authorImg,
    name: 'Kevin Martin',
    bio: 'Lacinia amet nisi ullamcorper eu suspendisse. Mattis nisl dignissim accumsan consectetur suspendisse amet.',
    socialLinks: [
        { icon: 'fab fa-facebook', url: '#' },
        { icon: 'fab fa-instagram', url: '#' },
        { icon: 'fab fa-twitter', url: '#' },
        { icon: 'fab fa-pinterest-p', url: '#' }
    ]
};

const prevPost = {
    title: 'Cargo flow through better<br> supply in UK',
    link: '/blog-details'
};

const nextPost = {
    title: 'Why is supply chain visibility<br> so important?',
    link: '/blog-details'
};

const comments = [
    {
        image: comment1,
        name: 'Richard Smith',
        date: 'September 19, 2025',
        text: 'Perspiciatis unde omnis iste natus error sit voluptatem accusant laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo'
    },
    {
        image: comment2,
        name: 'Laura Johnson',
        date: 'September 19, 2025',
        text: 'Perspiciatis unde omnis iste natus error sit voluptatem accusant laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo'
    }
];

const latestPosts = [
    {
        image: latestPost1,
        date: 'July 24, 2024',
        title: 'Top crypto exchange influencers',
        link: '/blog-details'
    },
    {
        image: latestPost2,
        date: 'July 24, 2024',
        title: 'Mauris non dignissim commodo Instralation',
        link: '/blog-details'
    },
    {
        image: latestPost3,
        date: 'July 24, 2024',
        title: 'Donec sit amet lacinia Instralation nulla.',
        link: '/blog-details'
    }
];

const categories = [
    { name: 'New Technologies', count: '07' },
    { name: 'Construction Introductions', count: '05' },
    { name: 'Instralation Accecories', count: '03' },
    { name: 'Business Advice', count: '07' },
    { name: 'Payment Processing', count: '08' },
    { name: 'Corporate Standup', count: '04' }
];

const sidebarTags = [
    'All Project',
    'Interiour',
    'Business',
    'Graphics',
    'Cargo',
    'Maintenance',
    'Consulting'
];

const handleReply = (comment) => {
    console.log('Reply to:', comment);
    // Implement reply logic here
};

const handleCommentSubmit = (formData) => {
    console.log('Comment submitted:', formData);
    // Implement comment submission logic here
};
</script>
