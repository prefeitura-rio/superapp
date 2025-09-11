'use client'

function getCertificateStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'certificate_available':
      return 'bg-card-3 text-background'
    case 'certificate_unavailable':
      return 'bg-secondary text-foreground'
    default:
      return 'bg-secondary text-zinc-900'
  }
}

export function MyCertificatesCard() {
  return (
    <div className="flex flex-col gap-3">
      {/* {courses.map((course: (typeof MY_CERTIFICATES)[0]) => (
        <button
          type="button"
          key={course.id}
          onClick={() => handleCourseClick(course)}
          className="flex items-start gap-3 rounded-lg p-3 bg-background transition cursor-pointer group w-full text-left"
        >
          <div className="relative w-30 h-30 overflow-hidden rounded-xl">
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
              {course.provider ? (
                <Image
                  src={providerIcons[course.provider]}
                  alt="provider"
                  width={15}
                  height={15}
                />
              ) : (
                <span className="text-[10px] font-semibold text-foreground uppercase">
                  {course.provider.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug text-foreground mb-2">
              {course.title}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              {course.modality} • {course.workload}
            </p>
            <span
              className={cn(
                'inline-block px-3 py-1 text-xs font-medium rounded-full w-fit',
                getCertificateStatusColor(course.status)
              )}
            >
              {course.status}
            </span>
          </div>
        </button>
      ))} */}

      {/* Bottom Sheets */}
      {/* <CoursesCertifiedDrawer
        open={openCertified}
        onOpenChange={setOpenCertified}
        courseTitle={selectedCourse?.title || ''}
      /> */}

      {/* <CoursesUnavailableDrawer
        open={openUnavailable}
        onOpenChange={setOpenUnavailable}
      /> */}
    </div>
  )
}
