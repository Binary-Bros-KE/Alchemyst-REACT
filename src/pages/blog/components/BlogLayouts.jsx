import { useSelector } from 'react-redux';
import ProfileCard from '../../../components/ProfileCard';
import SpaCard from '../../../components/SpaCard';
import { BLOG_LAYOUTS } from '../../../data/blogs';

// Confession Layout - Simple text-based
export const ConfessionLayout = ({ blog }) => {
  return (
    <article className="max-w-4xl mx-auto">
      <div className="prose prose-lg max-w-none">
        <div className="whitespace-pre-line leading-relaxed text-gray-700">
          {blog.content}
        </div>
      </div>
    </article>
  );
};

// Top Ten Layout - Alternating image and text
export const TopTenLayout = ({ blog }) => {
  return (
    <article className="max-w-4xl mx-auto">
      <div className='py-4'>
        {blog.intro}
      </div>
      {blog.sections?.map((section, index) => (
        <div key={index} className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {index + 1}. {section.title}
          </h2>
          
          <div className={`flex flex-col lg:flex-row gap-8 items-center ${
            section.imagePosition === 'right' ? 'lg:flex-row-reverse' : ''
          }`}>
            <div className="lg:w-1/2">
              <img
                src={section.image}
                alt={section.title}
                className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-md"
              />
            </div>
            
            <div className="lg:w-1/2">
              <p className="text-gray-700 mb-4 leading-relaxed">
                {section.description}
              </p>
              
              {section.tips && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Tips:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </article>
  );
};

// Spa Review Layout - Integrates with spa data
export const SpaReviewLayout = ({ blog }) => {
  const { allProfiles } = useSelector(state => state.profiles);
  
  const featuredSpas = allProfiles.filter(profile => 
    blog.featuredSpas?.includes(profile._id) && profile.userType === 'spa'
  );

  return (
    <article className="max-w-6xl mx-auto">
      {/* Introduction */}
      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-gray-700 leading-relaxed">{blog.introduction}</p>
      </div>

      {/* Featured Spas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {featuredSpas.map((spa, index) => (
          <div key={spa._id} className="relative">
            <div className="absolute -top-3 -left-3 z-10">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                #{index + 1}
              </span>
            </div>
            <SpaCard profile={spa} />
          </div>
        ))}
      </div>

      {/* Conclusion */}
      <div className="prose prose-lg max-w-none bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-700 leading-relaxed">{blog.conclusion}</p>
      </div>
    </article>
  );
};

// Profile Spotlight Layout - Integrates with escort/masseuse data
export const ProfileSpotlightLayout = ({ blog }) => {
  const { allProfiles } = useSelector(state => state.profiles);
  
  const featuredProfiles = allProfiles.filter(profile => 
    blog.featuredProfiles?.includes(profile._id) && profile.userType !== 'spa'
  );

  return (
    <article className="max-w-6xl mx-auto">
      {/* Introduction */}
      <div className="prose prose-lg max-w-none mb-12">
        <p className="text-gray-700 leading-relaxed">{blog.introduction}</p>
      </div>

      {/* Featured Profiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
        {featuredProfiles.map((profile) => (
          <ProfileCard key={profile._id} profile={profile} />
        ))}
      </div>

      {/* Conclusion */}
      <div className="prose prose-lg max-w-none bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-700 leading-relaxed">{blog.conclusion}</p>
      </div>
    </article>
  );
};

// Mixed Content Layout - Combines different elements
export const MixedContentLayout = ({ blog }) => {
  const { allProfiles } = useSelector(state => state.profiles);

  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case 'text':
        return (
          <div key={index} className="prose prose-lg max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed">{block.content}</p>
          </div>
        );
      
      case 'profile_spotlight':
        const profiles = allProfiles.filter(p => 
          block.profileIds?.includes(p._id) && p.userType !== 'spa'
        );
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Featured Profiles</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profiles.map(profile => (
                <ProfileCard key={profile._id} profile={profile} />
              ))}
            </div>
          </div>
        );
      
      case 'spa_spotlight':
        const spas = allProfiles.filter(p => 
          block.spaIds?.includes(p._id) && p.userType === 'spa'
        );
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Spas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spas.map(spa => (
                <SpaCard key={spa._id} profile={spa} />
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <article className="max-w-4xl mx-auto">
      {blog.content?.map(renderContentBlock)}
    </article>
  );
};

// Main layout selector
export const BlogLayout = ({ blog }) => {
  const layouts = {
    [BLOG_LAYOUTS.CONFESSION]: ConfessionLayout,
    [BLOG_LAYOUTS.TOP_TEN]: TopTenLayout,
    [BLOG_LAYOUTS.SPA_REVIEW]: SpaReviewLayout,
    [BLOG_LAYOUTS.PROFILE_SPOTLIGHT]: ProfileSpotlightLayout,
    [BLOG_LAYOUTS.MIXED_CONTENT]: MixedContentLayout,
  };

  const LayoutComponent = layouts[blog.layout] || ConfessionLayout;
  
  return <LayoutComponent blog={blog} />;
};