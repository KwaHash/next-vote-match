
const Vision = () => {
  return (
    <section className='py-20'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center space-y-4'>
          <div className='flex items-center justify-center gap-4 mb-4'>
            <span className='flex-1 max-w-12 h-px bg-indigo-300' aria-hidden />
            <span className='text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500'>私たちのビジョン</span>
            <span className='flex-1 max-w-12 h-px bg-indigo-300' aria-hidden />
          </div>
          <h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-12 leading-tight text-center'>私たちのビジョン</h2>
          <p className='text-lg text-gray-700'>「推し」という新しい視点で、政治をもっと身近に、もっと楽しく</p>
        </div>

        <div className='p-8 space-y-6 mt-8'>
          <p className='max-w-4xl leading-relaxed mx-auto'>
            政治は難しい、遠い存在だと感じていませんか？<br/>
            「わたしの政治」は、あなたの価値観に合った政治家を「推し」として応援する、新しい政治参加のプラットフォームです。
          </p>
          <p className='max-w-4xl leading-relaxed mx-auto'>
            好きなアイドルやアーティストを応援するように、あなたの理想を実現してくれる政治家を見つけて、応援し、一緒に未来を創っていく。
            それが「わたしの政治」の目指す世界です。
          </p>
        </div>
      </div>
    </section>
  )
}

export default Vision