import React from 'react'
import PackageCardHeader from './PackageCardHeader'
import PackageCardContent from './PackageCardContent'
import PackageCardBadges from './PackageCardBadges'
import PackageCardFooter from './PackageCardFooter'

const getTitle = (pkg) => pkg.title || pkg.name || 'Untitled Package'
const getCategory = (pkg) => pkg.category?.name || pkg.category || 'Uncategorised'
const isActivePkg = (pkg) => pkg.isActive !== false && pkg.status?.toLowerCase() !== 'inactive'

const PackageCard = ({
  pkg,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const title = getTitle(pkg)
  const category = getCategory(pkg)
  const active = isActivePkg(pkg)

  return (
    <article
      onClick={() => onView?.(pkg)}
      className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md cursor-pointer overflow-hidden"
    >
      <PackageCardHeader
        title={title}
        image={pkg.image}
        isActive={active}
      />

      <PackageCardContent
        title={title}
        category={category}
        price={pkg.price}
        testsIncluded={pkg.testsIncluded}
      />

      <PackageCardBadges isActive={active} />

      <PackageCardFooter
        pkg={pkg}
        onView={onView}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </article>
  )
}

export default PackageCard
