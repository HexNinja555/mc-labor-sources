import './brand-services.css';

const DESKTOP_SERVICES = [
  {
    className: 'agency',
    label: 'Request Manpower',
    href: 'https://mclabor.com/request-manpower/',
    image: '/brand/services/staffing.png',
    labelFirst: true,
  },
  {
    className: 'agency-payroll',
    label: 'Payroll',
    href: 'https://mclabor.com/services/agency-management/payroll-services/',
    image: '/brand/services/payroll.png',
    labelFirst: true,
  },
  {
    className: 'agency-funding',
    label: 'Safety',
    href: 'https://mclabor.com/safety-standards/',
    image: '/brand/services/1000005355.png',
    labelFirst: true,
  },
  {
    className: 'placement',
    label: 'Permanent placement',
    href: 'https://mclabor.com/services/permanent-placement/',
    image: '/brand/services/placement.png',
    labelFirst: false,
  },
  {
    className: 'staffing',
    label: 'Staffing Services',
    href: 'https://mclabor.com/services/staffing-services/',
    image: '/brand/services/staffing-1.png',
    labelFirst: false,
  },
  {
    className: 'apply',
    label: 'Apply',
    href: 'https://mclabor.com/jobs/',
    image: '/brand/services/apply-1.png',
    labelFirst: false,
  },
] as const;

const MOBILE_SERVICES = [
  {
    label: 'Request Manpower',
    href: 'https://mclabor.com/request-manpower/',
    image: '/brand/services/staffing.png',
  },
  {
    label: 'Payroll',
    href: 'https://mclabor.com/services/agency-management/payroll-services/',
    image: '/brand/services/payroll.png',
  },
  {
    label: 'Safety',
    href: 'https://mclabor.com/safety-standards/',
    image: '/brand/services/1000005355.png',
  },
  {
    label: 'Permanent placement',
    href: 'https://mclabor.com/services/permanent-placement/',
    image: '/brand/services/placement.png',
  },
  {
    label: 'Staffing Services',
    href: 'https://mclabor.com/services/staffing-services/',
    image: '/brand/services/staffing-1.png',
  },
  {
    label: 'Apply',
    href: 'https://mclabor.com/jobs/',
    image: '/brand/services/apply-1.png',
  },
] as const;

function ServiceImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  );
}

export function BrandServicesHome() {
  return (
    <div className="services">
      <h1>Our Services</h1>
      <div className="container">
        <div className="mid-bg mid-bg-1">
          {DESKTOP_SERVICES.map((service) => (
            <div key={service.className} className={service.className}>
              {service.labelFirst ? (
                <>
                  <div className="heading">{service.label}</div>
                  <div className="service-img">
                    <a href={service.href} target="_blank" rel="noopener noreferrer">
                      <ServiceImage src={service.image} alt={service.label} />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="service-img">
                    <a href={service.href} target="_blank" rel="noopener noreferrer">
                      <ServiceImage src={service.image} alt={service.label} />
                    </a>
                  </div>
                  <div className="heading">{service.label}</div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mobile-bg">
          {MOBILE_SERVICES.map((service) => (
            <div key={service.label} className="service-block">
              <div className="service-img">
                <a href={service.href} target="_blank" rel="noopener noreferrer">
                  <ServiceImage src={service.image} alt={service.label} />
                </a>
              </div>
              <div className="heading">
                <a href={service.href} target="_blank" rel="noopener noreferrer">
                  {service.label}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
